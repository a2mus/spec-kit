const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to the database!');
});

// In-memory store for latest collar locations (for real-time frontend updates)
const latestCollarData = new Map();

// --- API Endpoints ---

// Endpoint to get all fences
app.get('/api/fences', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, geo_json FROM "Fences"');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching fences:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Endpoint to save a new fence
app.post('/api/fences', async (req, res) => {
  const { name, geo_json } = req.body;
  if (!geo_json) {
    return res.status(400).send({ error: 'geo_json is required' });
  }

  try {
    const query = 'INSERT INTO "Fences" (name, geo_json) VALUES ($1, $2) RETURNING id';
    const result = await pool.query(query, [name, geo_json]);
    res.status(201).send({ message: 'Fence created successfully', fenceId: result.rows[0].id });
  } catch (error) {
    console.error('Error creating fence:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Endpoint for the collar to post data
app.post('/api/collars/data', async (req, res) => {
    const data = req.body;

    if (!data.collar_id || !data.timestamp) {
        return res.status(400).send({ error: 'collar_id and timestamp are required fields' });
    }

    // Update the in-memory store for real-time updates
    latestCollarData.set(data.collar_id, data);

    try {
        const historyQuery = `
            INSERT INTO "LocationHistory" (timestamp, collar_id, latitude, longitude, battery_voltage, body_temp, env_temp, env_humidity, roll, pitch, yaw, activity, heart_rate, spo2)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
        `;
        await pool.query(historyQuery, [
            data.timestamp,
            data.collar_id,
            data.latitude,
            data.longitude,
            data.battery_voltage,
            data.body_temp,
            data.env_temp,
            data.env_humidity,
            data.roll,
            data.pitch,
            data.yaw,
            data.activity,
            data.heart_rate || null, // Handle optional fields
            data.spo2 || null,
        ]);

        res.status(201).send({ message: 'Data ingested successfully' });
    } catch (error) {
        console.error('Error ingesting data:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});


// Endpoint for the frontend to poll for real-time data
app.get('/api/collars/latest', (req, res) => {
    // Convert Map to an array of objects to send as JSON
    const dataArray = Array.from(latestCollarData.values());
    res.status(200).json(dataArray);
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
