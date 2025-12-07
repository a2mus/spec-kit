"""
Local SQLite Database for BeagleBone
=====================================
Stores activity classification data locally for offline operation.
Provides sync functionality to push data to backend when connected.
"""

import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional
from contextlib import contextmanager


class LocalDatabase:
    """
    SQLite database for local activity data storage.
    
    Enables offline operation - data is stored locally and synced
    to backend TimescaleDB when connection is available.
    """
    
    SCHEMA = """
    -- Activity windows (matches backend IMUActivityWindows structure)
    CREATE TABLE IF NOT EXISTS activity_windows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        collar_id INTEGER NOT NULL,
        window_duration_sec INTEGER DEFAULT 60,
        sample_count INTEGER,
        
        -- Movement intensity statistics
        mov_mean REAL,
        mov_std REAL,
        mov_min REAL,
        mov_max REAL,
        
        -- Orientation statistics
        pitch_mean REAL,
        pitch_std REAL,
        roll_mean REAL,
        yaw_mean REAL,
        
        -- Classification result
        activity_type TEXT,
        activity_confidence REAL,
        classified_by TEXT DEFAULT 'beaglebone',
        
        -- Sync tracking
        synced INTEGER DEFAULT 0,
        sync_timestamp TEXT,
        
        -- Indexes for common queries
        UNIQUE(timestamp, collar_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_activity_collar_time 
        ON activity_windows(collar_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_activity_unsynced 
        ON activity_windows(synced) WHERE synced = 0;
    CREATE INDEX IF NOT EXISTS idx_activity_type 
        ON activity_windows(activity_type, timestamp DESC);
    
    -- Local alerts log
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        collar_id INTEGER NOT NULL,
        alert_type TEXT NOT NULL,
        severity TEXT DEFAULT 'warning',
        message TEXT,
        acknowledged INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS idx_alerts_unack 
        ON alerts(acknowledged) WHERE acknowledged = 0;
    """
    
    def __init__(self, db_path: str = "activity_data.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self) -> None:
        """Initialize database schema."""
        with self._get_connection() as conn:
            conn.executescript(self.SCHEMA)
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def store_activity_window(self, data: dict) -> int:
        """
        Store an activity window classification result.
        
        Args:
            data: Dictionary with classification data
            
        Returns:
            ID of inserted record
        """
        with self._get_connection() as conn:
            cursor = conn.execute("""
                INSERT OR REPLACE INTO activity_windows (
                    timestamp, collar_id, window_duration_sec, sample_count,
                    mov_mean, mov_std, mov_min, mov_max,
                    pitch_mean, pitch_std, roll_mean, yaw_mean,
                    activity_type, activity_confidence, classified_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data.get('timestamp'),
                data.get('collar_id'),
                data.get('window_duration_sec', 60),
                data.get('sample_count'),
                data.get('mov_mean'),
                data.get('mov_std'),
                data.get('mov_min'),
                data.get('mov_max'),
                data.get('pitch_mean'),
                data.get('pitch_std'),
                data.get('roll_mean'),
                data.get('yaw_mean'),
                data.get('activity_type'),
                data.get('activity_confidence'),
                data.get('classified_by', 'beaglebone'),
            ))
            return cursor.lastrowid
    
    def get_unsynced_windows(self, limit: int = 100) -> List[Dict]:
        """Get activity windows that haven't been synced to backend."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM activity_windows 
                WHERE synced = 0 
                ORDER BY timestamp ASC 
                LIMIT ?
            """, (limit,))
            return [dict(row) for row in cursor.fetchall()]
    
    def mark_synced(self, window_ids: List[int]) -> None:
        """Mark windows as synced to backend."""
        if not window_ids:
            return
        
        with self._get_connection() as conn:
            placeholders = ','.join('?' * len(window_ids))
            conn.execute(f"""
                UPDATE activity_windows 
                SET synced = 1, sync_timestamp = ?
                WHERE id IN ({placeholders})
            """, [datetime.now().isoformat()] + window_ids)
    
    def get_recent_activity(self, collar_id: int, minutes: int = 30) -> List[Dict]:
        """Get recent activity for a specific collar."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM activity_windows 
                WHERE collar_id = ? 
                  AND timestamp > datetime('now', ? || ' minutes')
                ORDER BY timestamp DESC
            """, (collar_id, -minutes))
            return [dict(row) for row in cursor.fetchall()]
    
    def get_activity_summary(self, collar_id: int, hours: int = 24) -> Dict:
        """Get activity summary for a collar over specified hours."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT 
                    activity_type,
                    COUNT(*) as count,
                    SUM(window_duration_sec) as total_seconds,
                    AVG(activity_confidence) as avg_confidence
                FROM activity_windows 
                WHERE collar_id = ? 
                  AND timestamp > datetime('now', ? || ' hours')
                GROUP BY activity_type
            """, (collar_id, -hours))
            
            summary = {}
            for row in cursor.fetchall():
                summary[row['activity_type']] = {
                    'count': row['count'],
                    'total_seconds': row['total_seconds'],
                    'avg_confidence': row['avg_confidence']
                }
            return summary
    
    # =========================================
    # Alert Methods
    # =========================================
    
    def store_alert(self, collar_id: int, alert_type: str, 
                    message: str, severity: str = 'warning') -> int:
        """Store a local alert."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                INSERT INTO alerts (timestamp, collar_id, alert_type, severity, message)
                VALUES (?, ?, ?, ?, ?)
            """, (datetime.now().isoformat(), collar_id, alert_type, severity, message))
            return cursor.lastrowid
    
    def get_unacknowledged_alerts(self) -> List[Dict]:
        """Get all unacknowledged alerts."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM alerts 
                WHERE acknowledged = 0 
                ORDER BY timestamp DESC
            """)
            return [dict(row) for row in cursor.fetchall()]
    
    def acknowledge_alert(self, alert_id: int) -> None:
        """Mark an alert as acknowledged."""
        with self._get_connection() as conn:
            conn.execute("""
                UPDATE alerts SET acknowledged = 1 WHERE id = ?
            """, (alert_id,))
    
    def get_unsynced_alerts(self, limit: int = 50) -> List[Dict]:
        """Get alerts that haven't been synced to backend."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM alerts 
                WHERE synced = 0 
                ORDER BY timestamp ASC 
                LIMIT ?
            """, (limit,))
            return [dict(row) for row in cursor.fetchall()]
    
    def mark_alerts_synced(self, alert_ids: List[int]) -> None:
        """Mark alerts as synced."""
        if not alert_ids:
            return
        
        with self._get_connection() as conn:
            placeholders = ','.join('?' * len(alert_ids))
            conn.execute(f"""
                UPDATE alerts SET synced = 1 WHERE id IN ({placeholders})
            """, alert_ids)
    
    # =========================================
    # Maintenance
    # =========================================
    
    def cleanup_old_data(self, days: int = 7) -> int:
        """Remove synced data older than specified days."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                DELETE FROM activity_windows 
                WHERE synced = 1 
                  AND timestamp < datetime('now', ? || ' days')
            """, (-days,))
            deleted_windows = cursor.rowcount
            
            conn.execute("""
                DELETE FROM alerts 
                WHERE synced = 1 
                  AND acknowledged = 1
                  AND timestamp < datetime('now', ? || ' days')
            """, (-days,))
            
            # Vacuum to reclaim space
            conn.execute("VACUUM")
            
            return deleted_windows
    
    def get_stats(self) -> Dict:
        """Get database statistics."""
        with self._get_connection() as conn:
            stats = {}
            
            cursor = conn.execute("SELECT COUNT(*) FROM activity_windows")
            stats['total_windows'] = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT COUNT(*) FROM activity_windows WHERE synced = 0")
            stats['unsynced_windows'] = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT COUNT(*) FROM alerts WHERE acknowledged = 0")
            stats['unack_alerts'] = cursor.fetchone()[0]
            
            # File size
            stats['db_size_bytes'] = os.path.getsize(self.db_path) if os.path.exists(self.db_path) else 0
            
            return stats
