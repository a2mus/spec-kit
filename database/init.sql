-- Enable the TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- =============================================
-- CATTLE REGISTRY
-- =============================================
CREATE TABLE "Cattle" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100),
    "tag_number" VARCHAR(50),          -- Ear tag or brand
    "breed" VARCHAR(100),
    "birth_date" DATE,
    "gender" VARCHAR(10),              -- male, female
    "weight_kg" REAL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- COLLARS REGISTRY
-- Tracks all discovered collars and their assignment status
-- =============================================
CREATE TABLE "Collars" (
    "id" SERIAL PRIMARY KEY,
    "collar_id" INTEGER UNIQUE NOT NULL,     -- ID from collar (9999 = unassigned)
    "cattle_id" INTEGER REFERENCES "Cattle"(id) ON DELETE SET NULL,
    "status" VARCHAR(20) DEFAULT 'unassigned', -- unassigned, active, inactive
    "pending_new_id" INTEGER,                -- New ID to send to collar (NULL if none)
    "alert_state" VARCHAR(20) DEFAULT 'safe', -- safe, warning_1, warning_2, breach
    "last_seen" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reserved collar ID for unassigned collars
-- When a new collar is activated, it sends ID=9999
-- The system assigns a unique ID and stores it in pending_new_id
INSERT INTO "Collars" ("collar_id", "status") VALUES (9999, 'reserved');

-- =============================================
-- VIRTUAL FENCES
-- =============================================
CREATE TABLE "Fences" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255),
    "geo_json" JSONB NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,        -- Whether this fence is active for geofence checking
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- LOCATION HISTORY (Time-series data)
-- Stores telemetry from collars
-- =============================================
CREATE TABLE "LocationHistory" (
    "timestamp" TIMESTAMPTZ NOT NULL,
    "collar_id" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "battery_voltage" REAL,
    "body_temp" REAL,
    "env_temp" REAL,
    "env_humidity" REAL,
    "roll" REAL,
    "pitch" REAL,
    "yaw" REAL,
    "movement_intensity" SMALLINT,   -- MOV value (0-255) from collar, NOT activity classification
    "heart_rate" INTEGER,            -- BPM from heart sensor
    "spo2" REAL,                     -- Blood oxygen saturation %
    -- Geofence direction and alert tracking
    "direction" VARCHAR(20),         -- 'entering', 'exiting', 'stationary', 'parallel'
    "alert_state" VARCHAR(20),       -- 'safe', 'warning_1', 'warning_2', 'breach'
    "alert_action_taken" VARCHAR(50) -- 'sound_low', 'sound_high', 'shock', 'suppressed', 'none'
);

-- Convert to TimescaleDB hypertable for efficient time-series queries
SELECT create_hypertable('"LocationHistory"', 'timestamp');

-- Index for faster lookups by collar_id and time
CREATE INDEX ON "LocationHistory" (collar_id, "timestamp" DESC);

-- =============================================
-- IMU ACTIVITY WINDOWS (Aggregated IMU features)
-- Stores computed features from raw IMU samples for ML classification
-- =============================================
CREATE TABLE "IMUActivityWindows" (
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

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('"IMUActivityWindows"', 'timestamp');

-- Index for activity queries
CREATE INDEX ON "IMUActivityWindows" (collar_id, "timestamp" DESC);
CREATE INDEX ON "IMUActivityWindows" (activity_type, "timestamp" DESC);

-- =============================================
-- HEALTH THRESHOLDS (for alerts)
-- =============================================
CREATE TABLE "HealthThresholds" (
    "id" SERIAL PRIMARY KEY,
    "metric" VARCHAR(50) UNIQUE NOT NULL,
    "min_healthy" REAL,
    "max_healthy" REAL,
    "min_warning" REAL,
    "max_warning" REAL,
    "unit" VARCHAR(20)
);

-- Insert default health thresholds
INSERT INTO "HealthThresholds" ("metric", "min_healthy", "max_healthy", "min_warning", "max_warning", "unit") VALUES
    ('body_temp', 37.5, 39.5, 37.0, 40.0, '°C'),
    ('heart_rate', 48, 84, 40, 100, 'BPM'),
    ('spo2', 95, 100, 90, 100, '%'),
    ('battery_voltage', 3.5, 4.2, 3.3, 4.2, 'V');
