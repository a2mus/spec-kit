import requests
import json
import time
from datetime import datetime
import random
import math

# Configuration
BACKEND_URL = "http://localhost:3001/api/collars/data"
HEADERS = {'Content-Type': 'application/json'}

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
        
        # IMU orientation
        self.roll = random.uniform(-5, 5)
        self.pitch = random.uniform(-5, 5)
        self.yaw = random.uniform(0, 360)
        
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


class HerdSimulator:
    """Manages a herd of simulated cattle."""
    
    def __init__(self, initial_cattle_ids=None):
        self.cattle = {}
        self.next_new_cattle_check = random.randint(30, 120)  # Cycles until next new cattle
        self.update_count = 0
        
        # Initialize with existing cattle
        if initial_cattle_ids:
            for collar_id in initial_cattle_ids:
                lat = random.uniform(MIN_LAT, MAX_LAT)
                lon = random.uniform(MIN_LON, MAX_LON)
                self.cattle[collar_id] = SimulatedCattle(collar_id, lat, lon)
    
    def add_new_cattle(self):
        """Simulate discovery of a new unassigned collar (ID=9999)."""
        # Check if we already have a 9999 waiting for assignment
        if 9999 in self.cattle:
            print("  ℹ️ New collar 9999 already exists, skipping...")
            return
        
        lat = random.uniform(MIN_LAT, MAX_LAT)
        lon = random.uniform(MIN_LON, MAX_LON)
        self.cattle[9999] = SimulatedCattle(9999, lat, lon, is_new=True)
        print(f"\n  🆕 NEW COLLAR DISCOVERED! (ID=9999)")
    
    def update(self):
        """Update all cattle for one cycle."""
        self.update_count += 1
        
        # Check for new cattle spawn
        if self.update_count >= self.next_new_cattle_check:
            if random.random() < 0.3:  # 30% chance when timer expires
                self.add_new_cattle()
            self.next_new_cattle_check = self.update_count + random.randint(30, 120)
        
        # Update all cattle
        for cattle in self.cattle.values():
            cattle.update()
    
    def get_packets(self):
        """Generate LoRa packets for all cattle (simulating staggered transmissions)."""
        packets = []
        for cattle in self.cattle.values():
            packets.append(cattle.generate_lora_packet())
        return packets
    
    def handle_collar_assignment(self, old_id, new_id):
        """Handle when a collar gets assigned a new ID."""
        if old_id in self.cattle and old_id == 9999:
            cattle = self.cattle.pop(old_id)
            cattle.collar_id = new_id
            cattle.is_new = False
            self.cattle[new_id] = cattle
            print(f"  ✅ Collar reassigned: 9999 → {new_id}")


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
        "spo2": random.randint(95, 100)
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
            
            # Generate and send packets for each cattle (staggered)
            packets = herd.get_packets()
            
            for packet in packets:
                parsed = parse_lora_packet(packet)
                send_to_backend(parsed, herd)
                time.sleep(0.5)  # Small delay between transmissions
            
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
