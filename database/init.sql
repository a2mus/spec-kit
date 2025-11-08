-- Enable the TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create a table to store virtual fence boundaries
CREATE TABLE "Fences" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255),
    "geo_json" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the main table for storing time-series collar data
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
    "activity" VARCHAR(50),
    "heart_rate" INTEGER, -- Proactively added for future use
    "spo2" REAL          -- Proactively added for future use
);

-- Convert the "LocationHistory" table into a TimescaleDB hypertable, partitioned by time
SELECT create_hypertable('"LocationHistory"', 'timestamp');

-- Add an index for faster lookups by collar_id and time
CREATE INDEX ON "LocationHistory" (collar_id, "timestamp" DESC);
