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
    "activity" VARCHAR(50),      -- Computed server-side, not from collar
    "heart_rate" INTEGER,        -- BPM from heart sensor
    "spo2" REAL                  -- Blood oxygen saturation %
);

-- Convert to TimescaleDB hypertable for efficient time-series queries
SELECT create_hypertable('"LocationHistory"', 'timestamp');

-- Index for faster lookups by collar_id and time
CREATE INDEX ON "LocationHistory" (collar_id, "timestamp" DESC);

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
