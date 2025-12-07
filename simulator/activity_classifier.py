"""
Activity Classifier Module for BeagleBone
==========================================
Provides LOCAL, INDEPENDENT activity classification without backend dependency.

Classification Types:
- LYING: Pitch > 45° + Low MOV (< 30)
- STANDING: |Pitch| < 15° + Low MOV (< 50)
- RESTING: Low MOV (< 30) sustained 2+ minutes
- MOVING: MOV > 100 OR significant position change
"""

from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from collections import deque
import statistics


class ActivityType(Enum):
    """Activity states that can be classified locally on BeagleBone."""
    LYING = "lying"
    STANDING = "standing"
    RESTING = "resting"
    MOVING = "moving"
    UNKNOWN = "unknown"


@dataclass
class IMUSample:
    """Single IMU sample from collar."""
    timestamp: datetime
    mov: float          # Movement intensity 0-255
    pitch: float        # Degrees
    roll: float         # Degrees
    yaw: float          # Degrees


@dataclass
class WindowFeatures:
    """Statistical features computed over a sliding window."""
    window_start: datetime
    window_end: datetime
    sample_count: int
    
    # Movement intensity stats
    mov_mean: float
    mov_std: float
    mov_min: float
    mov_max: float
    
    # Orientation stats
    pitch_mean: float
    pitch_std: float
    roll_mean: float
    yaw_mean: float
    
    def to_dict(self) -> dict:
        """Convert to dictionary for storage."""
        return {
            'window_start': self.window_start.isoformat(),
            'window_end': self.window_end.isoformat(),
            'sample_count': self.sample_count,
            'mov_mean': self.mov_mean,
            'mov_std': self.mov_std,
            'mov_min': self.mov_min,
            'mov_max': self.mov_max,
            'pitch_mean': self.pitch_mean,
            'pitch_std': self.pitch_std,
            'roll_mean': self.roll_mean,
            'yaw_mean': self.yaw_mean,
        }


class SlidingWindow:
    """
    Maintains a sliding window of IMU samples for feature computation.
    
    Default: 60-second window, computed every 30 seconds (50% overlap).
    """
    
    def __init__(self, window_size_sec: int = 60, min_samples: int = 5):
        self.window_size_sec = window_size_sec
        self.min_samples = min_samples
        self.samples: deque = deque()
        self.last_computation: Optional[datetime] = None
    
    def add_sample(self, mov: float, pitch: float, roll: float, yaw: float, 
                   timestamp: Optional[datetime] = None) -> None:
        """Add a new IMU sample to the window."""
        if timestamp is None:
            timestamp = datetime.now()
        
        sample = IMUSample(
            timestamp=timestamp,
            mov=mov,
            pitch=pitch,
            roll=roll,
            yaw=yaw
        )
        self.samples.append(sample)
        
        # Remove old samples outside the window
        cutoff = timestamp - timedelta(seconds=self.window_size_sec)
        while self.samples and self.samples[0].timestamp < cutoff:
            self.samples.popleft()
    
    def is_ready(self) -> bool:
        """Check if we have enough samples for classification."""
        if len(self.samples) < self.min_samples:
            return False
        
        # Ensure samples span at least half the window
        if self.samples:
            time_span = (self.samples[-1].timestamp - self.samples[0].timestamp).total_seconds()
            return time_span >= self.window_size_sec / 2
        return False
    
    def get_features(self) -> Optional[WindowFeatures]:
        """Compute statistical features over the current window."""
        if not self.is_ready():
            return None
        
        samples = list(self.samples)
        
        mov_values = [s.mov for s in samples]
        pitch_values = [s.pitch for s in samples]
        roll_values = [s.roll for s in samples]
        yaw_values = [s.yaw for s in samples]
        
        # Compute statistics
        mov_std = statistics.stdev(mov_values) if len(mov_values) > 1 else 0.0
        pitch_std = statistics.stdev(pitch_values) if len(pitch_values) > 1 else 0.0
        
        features = WindowFeatures(
            window_start=samples[0].timestamp,
            window_end=samples[-1].timestamp,
            sample_count=len(samples),
            mov_mean=statistics.mean(mov_values),
            mov_std=mov_std,
            mov_min=min(mov_values),
            mov_max=max(mov_values),
            pitch_mean=statistics.mean(pitch_values),
            pitch_std=pitch_std,
            roll_mean=statistics.mean(roll_values),
            yaw_mean=statistics.mean(yaw_values),
        )
        
        self.last_computation = datetime.now()
        return features
    
    def clear(self) -> None:
        """Clear all samples."""
        self.samples.clear()
        self.last_computation = None


class ActivityClassifier:
    """
    Threshold-based activity classifier.
    
    Runs LOCALLY on BeagleBone - no backend/ML required.
    """
    
    # Classification thresholds (tunable)
    THRESHOLDS = {
        'lying_pitch_min': 45.0,      # Pitch > 45° indicates lying
        'lying_mov_max': 30.0,        # Low movement when lying
        'standing_pitch_range': 15.0, # |Pitch| < 15° when standing
        'standing_mov_max': 50.0,     # Low movement when standing
        'resting_mov_max': 30.0,      # Very low movement when resting
        'moving_mov_min': 100.0,      # MOV > 100 indicates active movement
        'high_activity_mov': 180.0,   # Very high activity threshold
    }
    
    def __init__(self, custom_thresholds: Optional[Dict[str, float]] = None):
        self.thresholds = self.THRESHOLDS.copy()
        if custom_thresholds:
            self.thresholds.update(custom_thresholds)
        
        # Track sustained states for resting detection
        self.low_mov_start: Optional[datetime] = None
        self.resting_duration_sec = 120  # 2 minutes for resting classification
    
    def classify(self, features: WindowFeatures) -> Tuple[ActivityType, float]:
        """
        Classify activity based on window features.
        
        Returns:
            Tuple of (ActivityType, confidence 0.0-1.0)
        """
        mov_mean = features.mov_mean
        mov_max = features.mov_max
        pitch_mean = features.pitch_mean
        
        # Priority 1: MOVING (high activity)
        if mov_mean > self.thresholds['moving_mov_min'] or mov_max > self.thresholds['high_activity_mov']:
            confidence = min(1.0, mov_mean / 200.0)
            self.low_mov_start = None  # Reset resting tracker
            return ActivityType.MOVING, confidence
        
        # Priority 2: LYING (high pitch + low movement)
        if pitch_mean > self.thresholds['lying_pitch_min'] and mov_mean < self.thresholds['lying_mov_max']:
            # High confidence if pitch is very high
            confidence = min(1.0, (pitch_mean - 30) / 40.0)
            return ActivityType.LYING, max(0.6, confidence)
        
        # Priority 3: Check for sustained low movement (RESTING)
        if mov_mean < self.thresholds['resting_mov_max']:
            now = datetime.now()
            if self.low_mov_start is None:
                self.low_mov_start = now
            
            duration = (now - self.low_mov_start).total_seconds()
            if duration >= self.resting_duration_sec:
                confidence = min(1.0, duration / 300.0)  # Higher over time
                return ActivityType.RESTING, max(0.7, confidence)
        else:
            self.low_mov_start = None
        
        # Priority 4: STANDING (level pitch + low movement)
        if abs(pitch_mean) < self.thresholds['standing_pitch_range'] and \
           mov_mean < self.thresholds['standing_mov_max']:
            confidence = 0.7 + (0.3 * (1 - abs(pitch_mean) / 15.0))
            return ActivityType.STANDING, confidence
        
        # Default: UNKNOWN
        return ActivityType.UNKNOWN, 0.3
    
    def reset_state(self) -> None:
        """Reset internal state trackers."""
        self.low_mov_start = None


@dataclass
class ClassificationResult:
    """Result of activity classification for storage/sync."""
    collar_id: int
    timestamp: datetime
    window_duration_sec: int
    features: WindowFeatures
    activity_type: ActivityType
    confidence: float
    classified_by: str = "beaglebone"
    
    def to_dict(self) -> dict:
        """Convert to dictionary for database storage."""
        return {
            'collar_id': self.collar_id,
            'timestamp': self.timestamp.isoformat(),
            'window_duration_sec': self.window_duration_sec,
            'activity_type': self.activity_type.value,
            'activity_confidence': self.confidence,
            'classified_by': self.classified_by,
            **self.features.to_dict()
        }
