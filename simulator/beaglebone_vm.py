import requests
import json
import time
from datetime import datetime
import random
import math
import threading
import os

# Local activity classification modules
from activity_classifier import SlidingWindow, ActivityClassifier, ClassificationResult
from local_database import LocalDatabase
from alert_manager import AlertManager
from direction_tracker import DirectionTracker

# Configuration
BEAGLEBONE_ID = "BB_01"
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3001/api/collars/data")
ACTIVITY_API_URL = os.getenv("ACTIVITY_API_URL", "http://localhost:3001/api/imu-activity")
FENCE_SYNC_URL = os.getenv("FENCE_SYNC_URL", "http://localhost:3001/api/fences/sync")

# Headers for JSON content
HEADERS = {'Content-Type': 'application/json'}

# Geofence configuration (in meters)
BUFFER_ZONE_BOUNDARY = 10  # 10m buffer zone from fence edge
WARNING_1_DISTANCE = 15    # Stage 1: Sound alert at 10-15m from boundary
WARNING_2_DISTANCE = 10    # Stage 2: Intensified sound at 5-10m from boundary
BREACH_DISTANCE = 5        # Stage 3: Electric shock at 0-5m from boundary

# Escalation timing (seconds) - minimum time in zone before escalating
ESCALATION_DELAY_SECONDS = 5.0

# Health stress thresholds (disables shock when stressed)
STRESS_HEART_RATE_MAX = 100  # BPM - above this, disable shocks

# GPS accuracy buffer (meters) - added to all zones when accuracy is low
GPS_LOW_ACCURACY_BUFFER = 5

# Alert states
ALERT_SAFE = 'safe'
ALERT_WARNING_1 = 'warning_1'
ALERT_WARNING_2 = 'warning_2'
ALERT_BREACH = 'breach'

# Fence cache
cached_fences = []
last_fence_sync = 0
FENCE_SYNC_INTERVAL = 60  # Sync fences every 60 seconds

# =============================================
# GEOFENCE UTILITIES
# =============================================

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on Earth.
    Returns distance in meters.
    """
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def point_in_polygon(lat, lon, polygon):
    """
    Check if a point is inside a polygon using ray casting algorithm.
    polygon: list of dicts with 'lat' and 'lon' keys
    Returns True if point is inside polygon.
    """
    n = len(polygon)
    inside = False
    
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]['lat'], polygon[i]['lon']
        xj, yj = polygon[j]['lat'], polygon[j]['lon']
        
        if ((yi > lon) != (yj > lon)) and \
           (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    
    return inside

def distance_to_line_segment(point_lat, point_lon, lat1, lon1, lat2, lon2):
    """
    Calculate minimum distance from a point to a line segment.
    Returns distance in meters.
    """
    # Vector from p1 to p2
    dx = lat2 - lat1
    dy = lon2 - lon1
    
    if dx == 0 and dy == 0:
        # p1 and p2 are the same point
        return haversine_distance(point_lat, point_lon, lat1, lon1)
    
    # Parameter t for the closest point on the line
    t = max(0, min(1, ((point_lat - lat1) * dx + (point_lon - lon1) * dy) / (dx * dx + dy * dy)))
    
    # Closest point on the line segment
    closest_lat = lat1 + t * dx
    closest_lon = lon1 + t * dy
    
    return haversine_distance(point_lat, point_lon, closest_lat, closest_lon)

def distance_to_polygon_edge(lat, lon, polygon):
    """
    Calculate minimum distance from a point to any edge of a polygon.
    Returns distance in meters.
    """
    min_distance = float('inf')
    n = len(polygon)
    
    for i in range(n):
        j = (i + 1) % n
        dist = distance_to_line_segment(
            lat, lon,
            polygon[i]['lat'], polygon[i]['lon'],
            polygon[j]['lat'], polygon[j]['lon']
        )
        min_distance = min(min_distance, dist)
    
    return min_distance

def fetch_active_fences():
    """
    Fetch active fences from the backend API.
    Returns list of fence polygons.
    """
    global cached_fences, last_fence_sync
    
    current_time = time.time()
    if current_time - last_fence_sync < FENCE_SYNC_INTERVAL and cached_fences:
        return cached_fences
    
    try:
        response = requests.get(FENCE_SYNC_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            cached_fences = data.get('fences', [])
            last_fence_sync = current_time
            print(f"[BeagleBone] 🔄 Synced {len(cached_fences)} fences from backend")
            return cached_fences
    except Exception as e:
        print(f"[BeagleBone] ⚠️ Failed to sync fences: {e}")
    
    return cached_fences

def check_geofence_status(lat, lon):
    """
    Check the geofence status for a given position against ALL active fences.
    
    Logic:
    - If outside ALL fences: breach
    - If inside at least one fence but <5m from any edge: breach  
    - If 5-10m from any edge: warning_2
    - If 10-15m from any edge: warning_1
    - Otherwise: safe
    
    Returns: alert_state ('safe', 'warning_1', 'warning_2', 'breach')
    """
    fences = fetch_active_fences()
    
    # Edge case: No active fences
    if not fences:
        print("[BeagleBone] ⚠️ No active fences defined - defaulting to 'safe'")
        return ALERT_SAFE
    
    # Track aggregated state across all fences
    is_inside_any = False
    min_distance = float('inf')
    valid_fence_count = 0
    
    for fence in fences:
        try:
            polygon = fence.get('polygon', [])
            
            # Skip invalid polygons (need at least 3 vertices)
            if not polygon or len(polygon) < 3:
                fence_name = fence.get('name', 'Unknown')
                print(f"[BeagleBone] ⚠️ Skipping invalid fence '{fence_name}': insufficient vertices")
                continue
            
            valid_fence_count += 1
            
            # Check if point is inside this fence
            is_inside = point_in_polygon(lat, lon, polygon)
            if is_inside:
                is_inside_any = True
            
            # Calculate distance to this fence's edge
            distance = distance_to_polygon_edge(lat, lon, polygon)
            min_distance = min(min_distance, distance)
            
        except Exception as e:
            fence_name = fence.get('name', 'Unknown')
            print(f"[BeagleBone] ❌ Error processing fence '{fence_name}': {e}")
            continue
    
    # Edge case: All fences were invalid
    if valid_fence_count == 0:
        print("[BeagleBone] ⚠️ No valid fences found - defaulting to 'safe'")
        return ALERT_SAFE
    
    # Determine alert state based on aggregated results
    
    # If outside ALL fences - BREACH
    if not is_inside_any:
        return ALERT_BREACH
    
    # Inside at least one fence - check graduated alerts based on min distance to any edge
    if min_distance < BREACH_DISTANCE:
        # Within 5m of any boundary - Stage 3 (critical proximity)
        return ALERT_BREACH
    elif min_distance < WARNING_2_DISTANCE:
        # Between 5-10m from any edge - Stage 2
        return ALERT_WARNING_2
    elif min_distance < WARNING_1_DISTANCE:
        # Between 10-15m from any edge - Stage 1
        return ALERT_WARNING_1
    
    # Safe - inside fence and far from all edges
    return ALERT_SAFE

def get_alert_action(alert_state, suppressed=False, stress_override=False):
    """
    Get the collar action based on alert state.
    
    Args:
        alert_state: Current alert state
        suppressed: If True, alerts are suppressed (cattle returning)
        stress_override: If True, shocks are disabled due to stress
        
    Returns description of what the collar should do.
    """
    if suppressed:
        return "🔇 Alerts SUPPRESSED - cattle returning to safe zone"
    
    if stress_override and alert_state == ALERT_BREACH:
        return "⚠️ SHOCK DISABLED - cattle stressed (elevated heart rate)"
    
    actions = {
        ALERT_SAFE: "Normal operation",
        ALERT_WARNING_1: "🔊 Sound Alert - Low frequency beep",
        ALERT_WARNING_2: "🔊🔊 Sound Alert - High frequency rapid beep",
        ALERT_BREACH: "⚡ ELECTRIC SHOCK - Boundary breach!"
    }
    return actions.get(alert_state, "Unknown state")


def check_geofence_status_advanced(lat, lon, direction_tracker, heart_rate=None, previous_alert_state=None):
    """
    Advanced geofence check with direction detection and graduated escalation.
    
    This function implements the humane alert protocol:
    1. Detects movement direction (entering vs exiting fence)
    2. Suppresses alerts when cattle is returning to safe zone
    3. Enforces graduated escalation (warning_1 -> warning_2 -> breach)
    4. Disables shocks when cattle is stressed
    5. Only applies alerts when cattle is EXITING the fence
    
    Args:
        lat: Cattle latitude
        lon: Cattle longitude
        direction_tracker: DirectionTracker instance for this cattle
        heart_rate: Current heart rate (for stress detection)
        previous_alert_state: Previous alert state (for escalation logic)
        
    Returns:
        Tuple of (alert_state, action_taken, direction, suppressed, stress_override)
    """
    fences = fetch_active_fences()
    
    # Edge case: No active fences
    if not fences:
        return ALERT_SAFE, 'none', 'stationary', False, False
    
    # Calculate position data
    is_inside_any = False
    min_distance = float('inf')
    valid_fence_count = 0
    
    for fence in fences:
        try:
            polygon = fence.get('polygon', [])
            if not polygon or len(polygon) < 3:
                continue
            
            valid_fence_count += 1
            is_inside = point_in_polygon(lat, lon, polygon)
            if is_inside:
                is_inside_any = True
            
            distance = distance_to_polygon_edge(lat, lon, polygon)
            min_distance = min(min_distance, distance)
            
        except Exception as e:
            continue
    
    if valid_fence_count == 0:
        return ALERT_SAFE, 'none', 'stationary', False, False
    
    # Add position to direction tracker
    direction_tracker.add_position(lat, lon, min_distance)
    
    # Get movement direction
    direction = direction_tracker.get_direction()
    is_returning = direction_tracker.check_returning()
    
    # Determine base alert zone (position-based)
    if not is_inside_any:
        zone_alert = ALERT_BREACH
    elif min_distance < BREACH_DISTANCE:
        zone_alert = ALERT_BREACH
    elif min_distance < WARNING_2_DISTANCE:
        zone_alert = ALERT_WARNING_2
    elif min_distance < WARNING_1_DISTANCE:
        zone_alert = ALERT_WARNING_1
    else:
        zone_alert = ALERT_SAFE
    
    # Check for return path suppression (hysteresis logic)
    suppressed = False
    if is_returning and direction_tracker.should_suppress_alert(zone_alert):
        suppressed = True
    
    # Check for stress override (disable shocks)
    stress_override = False
    if heart_rate is not None and heart_rate > STRESS_HEART_RATE_MAX:
        stress_override = True
    
    # Determine final alert state and action based on direction
    action_taken = 'none'
    final_alert = zone_alert
    
    if suppressed:
        # Cattle returning - suppress all alerts, use safe state
        action_taken = 'suppressed'
        # Still track the zone but don't trigger alerts
    elif direction == DirectionTracker.DIRECTION_ENTERING:
        # Cattle entering fence (from outside or moving toward safe)
        # Don't trigger alerts - encourage entry
        action_taken = 'suppressed'
        suppressed = True
        if not is_inside_any:
            # Cattle is outside but entering - notify farmer but no alerts
            print(f"  🐄 Cattle DETECTED OUTSIDE fence but ENTERING - no alerts")
    elif direction == DirectionTracker.DIRECTION_EXITING or direction == DirectionTracker.DIRECTION_STATIONARY:
        # Cattle exiting or stationary in a zone - apply graduated escalation
        
        # Enforce graduated escalation (never skip stages)
        if previous_alert_state is None:
            previous_alert_state = ALERT_SAFE
        
        zone_order = [ALERT_SAFE, ALERT_WARNING_1, ALERT_WARNING_2, ALERT_BREACH]
        prev_idx = zone_order.index(previous_alert_state) if previous_alert_state in zone_order else 0
        zone_idx = zone_order.index(zone_alert) if zone_alert in zone_order else 0
        
        # Can only escalate one step at a time
        if zone_idx > prev_idx + 1:
            # Trying to skip stages - enforce sequential escalation
            if direction_tracker.can_escalate(ESCALATION_DELAY_SECONDS):
                final_alert = zone_order[prev_idx + 1]
                direction_tracker.start_escalation(prev_idx + 1)
            else:
                final_alert = previous_alert_state
        else:
            final_alert = zone_alert
        
        # Determine action
        if final_alert == ALERT_WARNING_1:
            action_taken = 'sound_low'
        elif final_alert == ALERT_WARNING_2:
            action_taken = 'sound_high'
        elif final_alert == ALERT_BREACH:
            if stress_override:
                action_taken = 'shock_disabled'
            else:
                action_taken = 'shock'
    
    # Update direction tracker's last alert zone (for return suppression)
    if not suppressed and final_alert != ALERT_SAFE:
        direction_tracker.update_alert_zone(final_alert)
    
    # Reset if returned to safe
    if zone_alert == ALERT_SAFE and is_inside_any:
        direction_tracker.reset_for_safe_zone()
    
    return final_alert, action_taken, direction, suppressed, stress_override

# Simulation parameters - Bounding box for cattle spawn area
# SW: 36°44′56.617419″N, 3°19′40.933086″E → NE: 36°45′11.901893″N, 3°20′11.274755″E
MIN_LAT = 36.7490604  # 36°44′56.617419″N
MAX_LAT = 36.7533061  # 36°45′11.901893″N
MIN_LON = 3.3280370   # 3°19′40.933086″E
MAX_LON = 3.3364652   # 3°20′11.274755″E

# Center point for reference
BASE_LAT = (MIN_LAT + MAX_LAT) / 2
BASE_LON = (MIN_LON + MAX_LON) / 2

# Cattle behavior states
STATES = ['GRAZING', 'WALKING', 'RESTING', 'STANDING', 'RUMINATING']
STATE_WEIGHTS = [35, 20, 15, 20, 10]  # Probability weights

class SimulatedCattle:
    """Represents a single cattle with realistic movement and behavior patterns."""
    
    def __init__(self, collar_id, lat, lon, is_new=False):
        self.collar_id = collar_id
        self.lat = lat
        self.lon = lon
        self.is_new = is_new  # True for ID=9999 (unassigned)
        
        # Current state
        self.state = random.choice(STATES)
        self.state_duration = 0  # How long in current state
        self.state_target_duration = self._get_state_duration()
        
        # Movement parameters
        self.heading = random.uniform(0, 360)  # Direction in degrees
        self.speed = 0.0  # meters per update cycle
        
        # Vitals (with some individual variation)
        self.base_body_temp = random.uniform(38.0, 39.0)
        self.battery = random.uniform(3.5, 4.2)
        self.battery_drain = random.uniform(0.001, 0.003)  # Per update
        
        # Heart rate for health monitoring (used for stress detection)
        self.heart_rate = random.randint(48, 84)  # Normal cattle range
        
        # IMU orientation
        self.roll = random.uniform(-5, 5)
        self.pitch = random.uniform(-5, 5)
        self.yaw = random.uniform(0, 360)
        
        # Movement intensity (MOV) - simulated 0-255 value
        self.mov = 0
        
        # Geofence alert state (enhanced for direction-aware system)
        self.alert_state = ALERT_SAFE
        self.previous_alert_state = ALERT_SAFE
        self.direction = 'stationary'  # 'entering', 'exiting', 'stationary', 'parallel'
        self.alert_action_taken = 'none'  # 'sound_low', 'sound_high', 'shock', 'suppressed', 'none'
        self.suppressed = False  # True if alerts are suppressed (returning to safe)
        self.stress_override = False  # True if shock disabled due to stress
        
        # Direction tracker for movement analysis
        self.direction_tracker = DirectionTracker(collar_id)
        
        # Activity classification (local)
        self.sliding_window = SlidingWindow(window_size_sec=60, min_samples=3)
        self.classifier = ActivityClassifier()
        self.classified_activity = None
        self.classification_confidence = 0.0
        
        print(f"  🐄 Cattle {collar_id} spawned at ({lat:.6f}, {lon:.6f}) - State: {self.state}")
    
    def _get_state_duration(self):
        """Get random duration for current state (in update cycles)."""
        durations = {
            'GRAZING': random.randint(20, 60),    # Long grazing sessions
            'WALKING': random.randint(5, 15),     # Short walks
            'RESTING': random.randint(30, 90),    # Long rest periods
            'STANDING': random.randint(10, 30),   # Medium standing
            'RUMINATING': random.randint(40, 80)  # Long rumination
        }
        return durations.get(self.state, 20)
    
    def _transition_state(self):
        """Transition to a new behavioral state."""
        old_state = self.state
        self.state = random.choices(STATES, weights=STATE_WEIGHTS, k=1)[0]
        self.state_duration = 0
        self.state_target_duration = self._get_state_duration()
        
        if old_state != self.state:
            print(f"  🔄 Cattle {self.collar_id}: {old_state} → {self.state}")
    
    def update(self):
        """Update cattle position and state for one cycle."""
        self.state_duration += 1
        
        # Check for state transition
        if self.state_duration >= self.state_target_duration:
            self._transition_state()
        
        # Movement based on state
        if self.state == 'GRAZING':
            # Slow meandering movement
            self.speed = random.uniform(0.1, 0.5)  # meters
            self.heading += random.uniform(-30, 30)  # Wander
        elif self.state == 'WALKING':
            # Faster, more directed movement
            self.speed = random.uniform(1.0, 2.5)
            self.heading += random.uniform(-10, 10)
        elif self.state in ['RESTING', 'STANDING', 'RUMINATING']:
            # Stationary or minimal movement
            self.speed = random.uniform(0, 0.05)
            # Small shifts in position
        
        # Calculate simulated MOV (movement intensity 0-255)
        self._update_mov()
        
        # Apply movement (convert meters to lat/lon degrees)
        # Approximately: 1 degree lat = 111,111m, 1 degree lon = 111,111 * cos(lat) m
        if self.speed > 0:
            heading_rad = math.radians(self.heading)
            delta_lat = (self.speed * math.cos(heading_rad)) / 111111.0
            delta_lon = (self.speed * math.sin(heading_rad)) / (111111.0 * math.cos(math.radians(self.lat)))
            
            self.lat += delta_lat
            self.lon += delta_lon
        
        # Add random small jitter (GPS noise)
        self.lat += random.uniform(-0.000005, 0.000005)
        self.lon += random.uniform(-0.000005, 0.000005)
        
        # Update IMU (orientation changes with movement)
        if self.state == 'RESTING':
            # Lying down - more pitch
            self.pitch = random.uniform(-20, -10)
            self.roll = random.uniform(-30, 30)
        elif self.state == 'GRAZING':
            # Head down
            self.pitch = random.uniform(10, 25)
            self.roll = random.uniform(-10, 10)
        else:
            # Normal standing/walking
            self.pitch = random.uniform(-5, 5)
            self.roll = random.uniform(-10, 10)
        
        self.yaw += random.uniform(-5, 5)
        self.yaw = self.yaw % 360
        
        # Battery drain
        self.battery = max(3.0, self.battery - self.battery_drain)
        
        # Simulate heart rate based on activity (for stress detection)
        if self.state == 'WALKING':
            self.heart_rate = random.randint(70, 95)  # Elevated during movement
        elif self.state == 'RESTING':
            self.heart_rate = random.randint(45, 60)  # Lower during rest
        else:
            self.heart_rate = random.randint(50, 80)  # Normal range
        
        # Check geofence status using advanced direction-aware logic
        self.previous_alert_state = self.alert_state
        (self.alert_state, 
         self.alert_action_taken, 
         self.direction, 
         self.suppressed, 
         self.stress_override) = check_geofence_status_advanced(
            self.lat, 
            self.lon, 
            self.direction_tracker,
            heart_rate=self.heart_rate,
            previous_alert_state=self.previous_alert_state
        )
        
        # Log alert state changes with direction info
        if self.alert_state != self.previous_alert_state or self.suppressed:
            direction_icon = {'entering': '↙️', 'exiting': '↗️', 'stationary': '⏸️', 'parallel': '↔️'}.get(self.direction, '❓')
            if self.suppressed:
                print(f"  🔇 Cattle {self.collar_id} {direction_icon} ALERTS SUPPRESSED - returning to safe zone")
            else:
                print(f"  ⚠️ Cattle {self.collar_id} {direction_icon} ALERT: {self.previous_alert_state} → {self.alert_state}")
                print(f"      Direction: {self.direction} | Action: {get_alert_action(self.alert_state, self.suppressed, self.stress_override)}")
                if self.stress_override:
                    print(f"      ❤️ Heart rate: {self.heart_rate} BPM (stressed - shock disabled)")
        
        # Add sample to sliding window for activity classification
        self.sliding_window.add_sample(
            mov=self.mov,
            pitch=self.pitch,
            roll=self.roll,
            yaw=self.yaw
        )
    
    def _update_mov(self):
        """Calculate simulated movement intensity (MOV) based on state."""
        if self.state == 'WALKING':
            self.mov = random.uniform(120, 180)
        elif self.state == 'GRAZING':
            self.mov = random.uniform(40, 80)
        elif self.state == 'STANDING':
            self.mov = random.uniform(15, 40)
        elif self.state == 'RESTING':
            self.mov = random.uniform(5, 25)
        elif self.state == 'RUMINATING':
            self.mov = random.uniform(10, 35)
        else:
            self.mov = random.uniform(20, 50)
    
    def classify_activity(self) -> tuple:
        """
        Perform local activity classification.
        
        Returns:
            Tuple of (activity_type, confidence) or (None, 0) if not ready
        """
        if not self.sliding_window.is_ready():
            return None, 0.0
        
        features = self.sliding_window.get_features()
        if features is None:
            return None, 0.0
        
        activity, confidence = self.classifier.classify(features)
        self.classified_activity = activity
        self.classification_confidence = confidence
        
        return activity, confidence
    
    def generate_lora_packet(self):
        """Generate a LoRa packet string simulating collar transmission."""
        now = datetime.now()
        
        # Determine lat/lon direction indicators
        lat_dir = 'N' if self.lat >= 0 else 'S'
        lon_dir = 'E' if self.lon >= 0 else 'W'
        
        # Environmental conditions (with some randomness)
        env_temp = 20.0 + random.uniform(-5, 10) + (5 if 10 <= now.hour <= 18 else -3)
        env_humidity = 50 + random.uniform(-20, 30)
        
        # Body temperature varies slightly with activity
        body_temp = self.base_body_temp
        if self.state == 'WALKING':
            body_temp += random.uniform(0.2, 0.5)
        elif self.state == 'RESTING':
            body_temp -= random.uniform(0.1, 0.3)
        
        collar_id = 9999 if self.is_new else self.collar_id
        
        packet = (
            f"ID={collar_id};"
            f"BATT={self.battery:.2f};"
            f"TEMP={env_temp:.1f};"
            f"HUM={env_humidity:.1f};"
            f"TB={body_temp:.1f};"
            f"TA={env_temp:.1f};"
            f"DAT={now.strftime('%d%m%y')};"
            f"TIM={now.strftime('%H%M%S')};"
            f"LAT={abs(self.lat):.6f}{lat_dir};"
            f"LON={abs(self.lon):.6f}{lon_dir};"
            f"R={self.roll:.1f};"
            f"P={self.pitch:.1f};"
            f"Y={self.yaw:.1f};"
            f"ACT={self.state}"
        )
        
        return packet
    
    def get_backend_payload(self):
        """
        Generate backend payload directly with direction tracking data.
        This bypasses the LoRa packet format to include all telemetry data.
        """
        now = datetime.now()
        
        # Environmental conditions
        env_temp = 20.0 + random.uniform(-5, 10) + (5 if 10 <= now.hour <= 18 else -3)
        env_humidity = 50 + random.uniform(-20, 30)
        
        # Body temperature varies slightly with activity
        body_temp = self.base_body_temp
        if self.state == 'WALKING':
            body_temp += random.uniform(0.2, 0.5)
        elif self.state == 'RESTING':
            body_temp -= random.uniform(0.1, 0.3)
        
        collar_id = 9999 if self.is_new else self.collar_id
        
        return {
            "collar_id": collar_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "latitude": self.lat,
            "longitude": self.lon,
            "battery_voltage": self.battery,
            "body_temp": body_temp,
            "env_temp": env_temp,
            "env_humidity": env_humidity,
            "roll": self.roll,
            "pitch": self.pitch,
            "yaw": self.yaw,
            "heart_rate": self.heart_rate,
            "spo2": random.randint(95, 100),
            # Direction tracking data for graduated alert system
            "alert_state": self.alert_state,
            "direction": self.direction,
            "alert_action_taken": self.alert_action_taken
        }


class HerdSimulator:
    """Manages a herd of simulated cattle."""
    
    def __init__(self, initial_cattle_ids=None, enable_local_classification=True):
        self.cattle = {}
        self.spawn_interval_cycles = 12  # Spawn new cattle every 12 cycles (60s at 5s interval)
        self.next_cattle_id = 2001  # Starting ID for auto-spawned cattle
        self.update_count = 0
        self.enable_local_classification = enable_local_classification
        
        # Local activity classification components
        if enable_local_classification:
            self.local_db = LocalDatabase(db_path="activity_data.db")
            self.alert_manager = AlertManager(db=self.local_db)
            print("  📊 Local activity classification ENABLED")
            print(f"     Database: activity_data.db")
        else:
            self.local_db = None
            self.alert_manager = None
        
        # Background sync configuration
        self.last_sync_attempt = 0
        self.sync_interval = 60  # Sync every 60 seconds
        self.backend_available = True  # Assume available initially
        
        # Initialize with existing cattle
        if initial_cattle_ids:
            for collar_id in initial_cattle_ids:
                lat = random.uniform(MIN_LAT, MAX_LAT)
                lon = random.uniform(MIN_LON, MAX_LON)
                self.cattle[collar_id] = SimulatedCattle(collar_id, lat, lon)
    
    def add_new_cattle(self):
        """Simulate discovery of a new cattle with a unique collar ID."""
        collar_id = self.next_cattle_id
        self.next_cattle_id += 1
        
        lat = random.uniform(MIN_LAT, MAX_LAT)
        lon = random.uniform(MIN_LON, MAX_LON)
        self.cattle[collar_id] = SimulatedCattle(collar_id, lat, lon, is_new=False)
        print(f"\n  🆕 NEW CATTLE SPAWNED! (ID={collar_id}) at ({lat:.6f}, {lon:.6f})")
    
    def update(self):
        """Update all cattle for one cycle."""
        self.update_count += 1
        
        # Spawn new cattle every 60 seconds (every 12 cycles at 5s interval)
        if self.update_count % self.spawn_interval_cycles == 0:
            self.add_new_cattle()
        
        # Update all cattle
        for cattle in self.cattle.values():
            cattle.update()
        
        # Perform local activity classification
        if self.enable_local_classification:
            self._classify_and_store()
    
    def get_packets(self):
        """Generate LoRa packets for all cattle (simulating staggered transmissions)."""
        packets = []
        for cattle in self.cattle.values():
            packets.append(cattle.generate_lora_packet())
        return packets
    
    def get_backend_payloads(self):
        """Generate backend payloads for all cattle with direction tracking data."""
        payloads = []
        for cattle in self.cattle.values():
            payloads.append(cattle.get_backend_payload())
        return payloads
    
    def handle_collar_assignment(self, old_id, new_id):
        """Handle when a collar gets assigned a new ID."""
        if old_id in self.cattle and old_id == 9999:
            cattle = self.cattle.pop(old_id)
            cattle.collar_id = new_id
            cattle.is_new = False
            self.cattle[new_id] = cattle
            print(f"  ✅ Collar reassigned: 9999 → {new_id}")
    
    def _classify_and_store(self):
        """
        Perform local activity classification for all cattle and store results.
        This runs independently of backend - works offline.
        """
        for cattle in self.cattle.values():
            # Skip reserved collar ID
            if cattle.is_new:
                continue
            
            # Attempt classification
            activity, confidence = cattle.classify_activity()
            
            if activity is not None:
                # Log classification
                print(f"  📊 Cattle {cattle.collar_id}: {cattle.state} → "
                      f"classified as {activity.value.upper()} (conf: {confidence:.2f})")
                
                # Get features for storage
                features = cattle.sliding_window.get_features()
                if features and self.local_db:
                    # Store in local SQLite
                    data = {
                        'timestamp': datetime.now().isoformat(),
                        'collar_id': cattle.collar_id,
                        'window_duration_sec': 60,
                        'sample_count': features.sample_count,
                        'mov_mean': features.mov_mean,
                        'mov_std': features.mov_std,
                        'mov_min': features.mov_min,
                        'mov_max': features.mov_max,
                        'pitch_mean': features.pitch_mean,
                        'pitch_std': features.pitch_std,
                        'roll_mean': features.roll_mean,
                        'yaw_mean': features.yaw_mean,
                        'activity_type': activity.value,
                        'activity_confidence': confidence,
                        'classified_by': 'beaglebone'
                    }
                    self.local_db.store_activity_window(data)
                
                # Check for alerts
                if self.alert_manager:
                    alerts = self.alert_manager.check_activity(
                        collar_id=cattle.collar_id,
                        activity_type=activity.value,
                        mov=cattle.mov
                    )
                    for alert in alerts:
                        self.alert_manager.trigger_alert(alert)
                    
                    # Also check battery
                    battery_alert = self.alert_manager.check_battery(
                        cattle.collar_id, 
                        cattle.battery
                    )
                    if battery_alert:
                        self.alert_manager.trigger_alert(battery_alert)
    
    def sync_to_backend(self, sync_url: str = None):
        """
        Sync unsynced activity data to backend.
        Called periodically when backend is available.
        
        Returns:
            Number of records synced, or -1 if sync failed
        """
        if not self.local_db:
            return 0
        
        if sync_url is None:
            sync_url = "http://localhost:3001/api/imu-activity"
        
        try:
            # Get unsynced windows
            unsynced = self.local_db.get_unsynced_windows(limit=50)
            if not unsynced:
                return 0
            
            # Prepare batch payload
            payload = {'activity_windows': unsynced}
            
            response = requests.post(
                sync_url, 
                json=payload, 
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                # Mark as synced
                window_ids = [w['id'] for w in unsynced]
                self.local_db.mark_synced(window_ids)
                self.backend_available = True
                print(f"  ☁️ Synced {len(unsynced)} activity windows to backend")
                return len(unsynced)
            else:
                print(f"  ⚠️ Backend sync failed: {response.status_code}")
                self.backend_available = False
                return -1
                
        except requests.exceptions.RequestException as e:
            self.backend_available = False
            # Silent fail - we're offline, data stays in local DB
            return -1
    
    def get_local_stats(self) -> dict:
        """Get statistics about local data storage."""
        if self.local_db:
            return self.local_db.get_stats()
        return {}
    
    def print_classification_summary(self):
        """Print a summary of current activity classifications."""
        print("\n  📋 ACTIVITY CLASSIFICATION SUMMARY:")
        for collar_id, cattle in self.cattle.items():
            if cattle.classified_activity:
                print(f"     Collar {collar_id}: {cattle.classified_activity.value} "
                      f"(conf: {cattle.classification_confidence:.2f})")
            else:
                print(f"     Collar {collar_id}: [awaiting samples]")


def parse_lora_packet(raw_string):
    """
    Simulates parsing the raw LoRa string from the UART port.
    Format: ID=9920;BATT=3.70;TEMP=45.0;HUM=54.9;TB=0.00;...
    """
    print(f"\n[BeagleBone] 📡 Received LoRa Packet: {raw_string}")
    
    parts = raw_string.split(';')
    data = {}
    
    for part in parts:
        if '=' in part:
            key, value = part.split('=')
            data[key] = value
            
    # Map raw fields to backend schema
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Parse Lat/Lon (remove N/W/E/S and convert)
    lat_raw = data.get('LAT', '0N')
    lon_raw = data.get('LON', '0E')
    
    lat = float(lat_raw[:-1]) * (1 if lat_raw.endswith('N') else -1)
    lon = float(lon_raw[:-1]) * (1 if lon_raw.endswith('E') else -1)
    
    # Check geofence status for this position
    alert_state = check_geofence_status(lat, lon)

    parsed_data = {
        "collar_id": int(data.get('ID', 0)),
        "timestamp": timestamp,
        "latitude": lat,
        "longitude": lon,
        "battery_voltage": float(data.get('BATT', 0)),
        "body_temp": float(data.get('TB', 0)),
        "env_temp": float(data.get('TEMP', 0)),
        "env_humidity": float(data.get('HUM', 0)),
        "roll": float(data.get('R', 0)),
        "pitch": float(data.get('P', 0)),
        "yaw": float(data.get('Y', 0)),
        "heart_rate": random.randint(50, 80),
        "spo2": random.randint(95, 100),
        "alert_state": alert_state
    }
    
    return parsed_data

def send_to_backend(payload, herd=None):
    """
    Sends parsed data to Node.js backend and checks for config.
    """
    collar_id = payload.get('collar_id')
    print(f"[BeagleBone] 🚀 Sending data for collar {collar_id}...")
    
    try:
        response = requests.post(BACKEND_URL, json=payload, headers=HEADERS)
        
        if response.status_code in [200, 201]:
            response_json = response.json()
            
            # CHECK FOR PENDING CONFIG (The RX Window Logic)
            if 'pending_config' in response_json:
                new_id = response_json['pending_config'].get('new_id')
                print(f"[BeagleBone] ⚠️ CONFIG RECEIVED! New Collar ID: {new_id}")
                print(f"[BeagleBone] 🔄 Switching LoRa to TX... Sending new ID {new_id} to collar...")
                
                if new_id:
                    confirm_id_change(collar_id, new_id)
                    if herd:
                        herd.handle_collar_assignment(collar_id, new_id)
            else:
                print(f"[BeagleBone] ✅ Collar {collar_id} data sent successfully")
        else:
            print(f"[BeagleBone] ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"[BeagleBone] 💥 Connection Failed: {e}")

def confirm_id_change(old_id, new_id):
    """
    Simulates the BeagleBone confirming to the backend that the collar accepted the new ID.
    """
    confirm_url = f"http://localhost:3001/api/collars/{old_id}/confirm-new-id"
    print(f"[BeagleBone] 📝 Confirming ID change to backend...")
    try:
        requests.post(confirm_url, json={'new_id': new_id})
        print(f"[BeagleBone] ✅ ID Change Confirmed.")
    except Exception as e:
        print(f"[BeagleBone] ❌ Confirmation Failed: {e}")


def run_continuous_simulation(interval_seconds=5, initial_cattle=None):
    """
    Run continuous simulation of cattle movement and data transmission.
    
    Args:
        interval_seconds: Time between update cycles
        initial_cattle: List of collar IDs to start with
    """
    if initial_cattle is None:
        initial_cattle = [1001, 1002, 1003]  # Default herd (new IDs to avoid old data)
    
    print("\n" + "=" * 60)
    print("🐄 BEAGLEBONE CATTLE SIMULATOR - CONTINUOUS MODE 🐄")
    print("=" * 60)
    print(f"  Base Location: ({BASE_LAT}, {BASE_LON})")
    print(f"  Update Interval: {interval_seconds}s")
    print(f"  Initial Herd: {initial_cattle}")
    print("=" * 60 + "\n")
    
    herd = HerdSimulator(initial_cattle)
    
    cycle = 0
    try:
        while True:
            cycle += 1
            print(f"\n{'='*40}")
            print(f"📍 CYCLE {cycle} - {datetime.now().strftime('%H:%M:%S')}")
            print(f"{'='*40}")
            print(f"  Herd size: {len(herd.cattle)} cattle")
            
            # Update all cattle positions and states
            herd.update()
            
            # Send telemetry data for each cattle (with direction tracking)
            payloads = herd.get_backend_payloads()
            
            for payload in payloads:
                collar_id = payload.get('collar_id')
                direction = payload.get('direction', 'stationary')
                alert_state = payload.get('alert_state', 'safe')
                print(f"\n[BeagleBone] 📡 Collar {collar_id}: Direction={direction}, Alert={alert_state}")
                send_to_backend(payload, herd)
                time.sleep(0.5)  # Small delay between transmissions
            
            # Periodic background sync of ACTIVITY DATA (every ~60s)
            if cycle % 12 == 0:  # Assuming 5s interval
                herd.sync_to_backend()
                
            # Print activity summary (every ~30s)
            if cycle % 6 == 0:
                herd.print_classification_summary()
            
            print(f"\n⏳ Waiting {interval_seconds}s until next cycle...")
            time.sleep(interval_seconds)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Simulation stopped by user.")
        print(f"  Total cycles: {cycle}")
        print(f"  Final herd size: {len(herd.cattle)}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='BeagleBone Cattle Simulator')
    parser.add_argument('--mode', choices=['single', 'continuous'], default='continuous',
                        help='Run mode: single (one-shot) or continuous')
    parser.add_argument('--interval', type=int, default=5,
                        help='Seconds between updates in continuous mode')
    parser.add_argument('--cattle', type=str, default='1001,1002,1003',
                        help='Comma-separated list of initial collar IDs')
    
    args = parser.parse_args()
    
    initial_cattle = [int(x.strip()) for x in args.cattle.split(',')]
    
    if args.mode == 'single':
        # Original one-shot mode for quick testing
        print("--- SINGLE SHOT MODE ---")
        
        # Simulate a NEW/UNASSIGNED collar (ID=9999)
        print("--- SCENARIO 1: New Collar Discovery ---")
        raw_packet_new = "ID=9999;BATT=3.70;TEMP=25.0;HUM=54.9;TB=38.5;TA=25.0;DAT=061225;TIM=100000;LAT=36.7359N;LON=3.34018E;R=5.5;P=1.2;Y=120.0;ACT=GRAZING"
        parsed_new = parse_lora_packet(raw_packet_new)
        send_to_backend(parsed_new)
        
        print("\n" + "="*50 + "\n")
        
        # Simulate an EXISTING/ACTIVE collar
        print("--- SCENARIO 2: Existing Collar Update ---")
        raw_packet_old = "ID=101;BATT=3.65;TEMP=26.0;HUM=50.0;TB=38.2;TA=26.0;DAT=061225;TIM=100010;LAT=36.7360N;LON=3.34020E;R=2.0;P=0.5;Y=122.0;ACT=STANDING"
        parsed_old = parse_lora_packet(raw_packet_old)
        send_to_backend(parsed_old)

        print("\n[BeagleBone] Simulation Cycle Complete.")
    else:
        # Continuous simulation mode
        run_continuous_simulation(
            interval_seconds=args.interval,
            initial_cattle=initial_cattle
        )
