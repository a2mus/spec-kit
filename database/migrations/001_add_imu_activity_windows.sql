-- =============================================
-- MIGRATION: Rename activity to movement_intensity
-- Add IMUActivityWindows table for ML classification
-- =============================================
-- Run this on existing databases to apply the schema changes

-- Step 1: Rename activity column to movement_intensity in LocationHistory
-- Note: This changes the semantics - it's no longer a classification, just the raw MOV value
ALTER TABLE "LocationHistory" 
    RENAME COLUMN "activity" TO "movement_intensity_old";

ALTER TABLE "LocationHistory" 
    ADD COLUMN "movement_intensity" SMALLINT;

-- Optionally migrate old data (if activity was stored as text like 'resting', 'moving', etc.)
-- This converts text activity to a numeric scale (adjust as needed)
UPDATE "LocationHistory" SET "movement_intensity" = CASE
    WHEN "movement_intensity_old" = 'resting' THEN 20
    WHEN "movement_intensity_old" = 'standing' THEN 40
    WHEN "movement_intensity_old" = 'grazing' THEN 80
    WHEN "movement_intensity_old" = 'walking' THEN 120
    WHEN "movement_intensity_old" = 'moving' THEN 150
    WHEN "movement_intensity_old" = 'running' THEN 220
    ELSE NULL
END;

-- Drop old column after verification
-- Uncomment after verifying the migration worked correctly
-- ALTER TABLE "LocationHistory" DROP COLUMN "movement_intensity_old";

-- Step 2: Create IMUActivityWindows table
CREATE TABLE IF NOT EXISTS "IMUActivityWindows" (
    "id" SERIAL,
    "timestamp" TIMESTAMPTZ NOT NULL,    -- Start of the window
    "collar_id" INTEGER NOT NULL,
    "window_duration_sec" INTEGER NOT NULL DEFAULT 60,  -- Window size in seconds
    "sample_count" INTEGER,              -- Number of raw samples in this window
    
    -- Accelerometer statistics (in g-force or m/s²)
    "accel_mean_x" REAL,
    "accel_mean_y" REAL,
    "accel_mean_z" REAL,
    "accel_std_x" REAL,                  -- Standard deviation (movement variability)
    "accel_std_y" REAL,
    "accel_std_z" REAL,
    "accel_magnitude_mean" REAL,         -- Mean of sqrt(x²+y²+z²)
    "accel_magnitude_std" REAL,          -- Std of magnitude
    
    -- Gyroscope statistics (in degrees/sec)
    "gyro_mean_x" REAL,
    "gyro_mean_y" REAL,
    "gyro_mean_z" REAL,
    "gyro_std_x" REAL,
    "gyro_std_y" REAL,
    "gyro_std_z" REAL,
    
    -- Derived orientation/posture
    "orientation_pitch" REAL,            -- Head up/down angle
    "orientation_roll" REAL,             -- Head tilt
    
    -- Aggregated movement intensity
    "movement_intensity_avg" REAL,       -- Average MOV value in window
    "movement_intensity_max" REAL,       -- Max MOV value in window
    
    -- Activity classification (computed by BeagleBone or Backend ML)
    "activity_type" VARCHAR(50),         -- 'grazing', 'resting', 'walking', 'ruminating', 'standing', 'lying', 'unknown'
    "activity_confidence" REAL,          -- ML model confidence (0.0 - 1.0)
    "classified_by" VARCHAR(20),         -- 'beaglebone' or 'backend'
    
    PRIMARY KEY ("id", "timestamp")
);

-- Convert to TimescaleDB hypertable if not already
SELECT create_hypertable('"IMUActivityWindows"', 'timestamp', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS "imuactivitywindows_collar_timestamp_idx" 
    ON "IMUActivityWindows" (collar_id, "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "imuactivitywindows_activity_timestamp_idx" 
    ON "IMUActivityWindows" (activity_type, "timestamp" DESC);

-- =============================================
-- VERIFICATION QUERIES
-- Run these to verify the migration worked
-- =============================================

-- Check LocationHistory schema
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'LocationHistory';

-- Check IMUActivityWindows exists
-- SELECT * FROM "IMUActivityWindows" LIMIT 1;

-- =============================================
-- ROLLBACK (if needed)
-- =============================================
-- To rollback:
-- ALTER TABLE "LocationHistory" RENAME COLUMN "movement_intensity" TO "movement_intensity_new";
-- ALTER TABLE "LocationHistory" RENAME COLUMN "movement_intensity_old" TO "activity";
-- ALTER TABLE "LocationHistory" DROP COLUMN "movement_intensity_new";
-- DROP TABLE "IMUActivityWindows";
