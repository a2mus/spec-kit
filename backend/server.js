const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

// Reserved collar ID for unassigned/new collars
const UNASSIGNED_COLLAR_ID = 9999;

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

// =============================================
// FENCE ENDPOINTS
// =============================================

app.get('/api/fences', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, geo_json, is_active FROM "Fences"');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching fences:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Endpoint for BeagleBone to sync active fences
app.get('/api/fences/sync', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, geo_json 
      FROM "Fences" 
      WHERE is_active = TRUE
    `);

    // Format fences for BeagleBone processing
    const fences = result.rows.map(fence => ({
      id: fence.id,
      name: fence.name,
      // Convert GeoJSON to simple coordinate array for easier processing
      polygon: fence.geo_json.coordinates[0].map(coord => ({
        lat: coord[1],
        lon: coord[0]
      }))
    }));

    res.status(200).json({
      timestamp: new Date().toISOString(),
      fence_count: fences.length,
      fences: fences
    });
  } catch (error) {
    console.error('Error syncing fences:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.post('/api/fences', async (req, res) => {
  const { name, geo_json } = req.body;
  if (!geo_json) {
    return res.status(400).send({ error: 'geo_json is required' });
  }

  try {
    const query = 'INSERT INTO "Fences" (name, geo_json, is_active) VALUES ($1, $2, TRUE) RETURNING id';
    const result = await pool.query(query, [name, geo_json]);
    res.status(201).send({ message: 'Fence created successfully', fenceId: result.rows[0].id });
  } catch (error) {
    console.error('Error creating fence:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Toggle fence active status
app.patch('/api/fences/:id/toggle', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).send({ error: 'Invalid fence id' });
  }

  try {
    const result = await pool.query(`
      UPDATE "Fences" 
      SET is_active = NOT is_active, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, name, is_active
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).send({ error: 'Fence not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling fence:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.delete('/api/fences/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).send({ error: 'Invalid fence id' });
  }

  try {
    const result = await pool.query('DELETE FROM "Fences" WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send({ error: 'Fence not found' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting fence:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// =============================================
// CATTLE ENDPOINTS
// =============================================

app.get('/api/cattle', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, col.collar_id as assigned_collar_id, col.status as collar_status
      FROM "Cattle" c
      LEFT JOIN "Collars" col ON col.cattle_id = c.id
      ORDER BY c.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching cattle:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.post('/api/cattle', async (req, res) => {
  const { name, tag_number, breed, birth_date, gender, weight_kg, notes } = req.body;

  try {
    const query = `
      INSERT INTO "Cattle" (name, tag_number, breed, birth_date, gender, weight_kg, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [name, tag_number, breed, birth_date, gender, weight_kg, notes]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating cattle:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.patch('/api/cattle/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, tag_number, breed, birth_date, gender, weight_kg, notes } = req.body;

  try {
    const query = `
      UPDATE "Cattle" 
      SET name = COALESCE($1, name),
          tag_number = COALESCE($2, tag_number),
          breed = COALESCE($3, breed),
          birth_date = COALESCE($4, birth_date),
          gender = COALESCE($5, gender),
          weight_kg = COALESCE($6, weight_kg),
          notes = COALESCE($7, notes),
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    const result = await pool.query(query, [name, tag_number, breed, birth_date, gender, weight_kg, notes, id]);
    if (result.rowCount === 0) {
      return res.status(404).send({ error: 'Cattle not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating cattle:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.delete('/api/cattle/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const result = await pool.query('DELETE FROM "Cattle" WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send({ error: 'Cattle not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting cattle:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// =============================================
// COLLAR ENDPOINTS
// =============================================

// Get all collars with their assignment status
app.get('/api/collars', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT col.*, c.name as cattle_name, c.tag_number
      FROM "Collars" col
      LEFT JOIN "Cattle" c ON col.cattle_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND col.status = $1';
      params.push(status);
    }

    query += ' ORDER BY col.last_seen DESC NULLS LAST';

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching collars:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Assign a collar to cattle (and generate new ID)
app.patch('/api/collars/:id/assign', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { cattle_id } = req.body;

  try {
    // Generate a new unique collar ID (find max and add 1, starting from 100)
    const maxResult = await pool.query(`
      SELECT COALESCE(MAX(collar_id), 99) as max_id 
      FROM "Collars" 
      WHERE collar_id < $1
    `, [UNASSIGNED_COLLAR_ID]);
    const newCollarId = Math.max(100, maxResult.rows[0].max_id + 1);

    // Update the collar
    const query = `
      UPDATE "Collars"
      SET cattle_id = $1,
      status = 'active',
      pending_new_id = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [cattle_id, newCollarId, id]);

    if (result.rowCount === 0) {
      return res.status(404).send({ error: 'Collar not found' });
    }

    res.status(200).json({
      ...result.rows[0],
      message: `Collar will be assigned ID ${newCollarId} on next sync`
    });
  } catch (error) {
    console.error('Error assigning collar:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Unassign a collar from cattle
app.patch('/api/collars/:id/unassign', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const query = `
      UPDATE "Collars"
      SET cattle_id = NULL,
      status = 'inactive'
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).send({ error: 'Collar not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error unassigning collar:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Delete a collar
app.delete('/api/collars/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).send({ error: 'Invalid collar id' });
  }

  try {
    // First get the collar to know its collar_id for cleanup
    const collarResult = await pool.query('SELECT collar_id FROM "Collars" WHERE id = $1', [id]);

    if (collarResult.rowCount === 0) {
      return res.status(404).send({ error: 'Collar not found' });
    }

    const collarId = collarResult.rows[0].collar_id;

    // Delete the collar from the database
    await pool.query('DELETE FROM "Collars" WHERE id = $1', [id]);

    // Also remove from in-memory cache
    latestCollarData.delete(collarId);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting collar:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// =============================================
// COLLAR DATA INGESTION (from BeagleBone)
// =============================================

app.post('/api/collars/data', async (req, res) => {
  const data = req.body;

  if (!data.collar_id || !data.timestamp) {
    return res.status(400).send({ error: 'collar_id and timestamp are required fields' });
  }

  try {
    // Check if this is a new/unassigned collar (ID = 9999)
    let pendingConfig = null;

    if (data.collar_id === UNASSIGNED_COLLAR_ID) {
      // This is a new collar (ID 9999)
      // Check if the reserved entry exists (regardless of status)
      const checkResult = await pool.query(
        'SELECT * FROM "Collars" WHERE collar_id = $1',
        [UNASSIGNED_COLLAR_ID]
      );

      let collarRecord;

      if (checkResult.rowCount === 0) {
        // Should not happen if init.sql ran, but safe fallback
        const insertResult = await pool.query(
          'INSERT INTO "Collars" (collar_id, status, last_seen) VALUES ($1, $2, $3) RETURNING *',
          [UNASSIGNED_COLLAR_ID, 'discovered', new Date(data.timestamp)]
        );
        collarRecord = insertResult.rows[0];
      } else {
        // Update status to 'discovered' so it shows in UI, and update timestamp
        const updateResult = await pool.query(
          'UPDATE "Collars" SET status = $1, last_seen = $2 WHERE collar_id = $3 RETURNING *',
          ['discovered', new Date(data.timestamp), UNASSIGNED_COLLAR_ID]
        );
        collarRecord = updateResult.rows[0];
      }

      // Check for pending config (e.g., if it was just assigned a new ID)
      if (collarRecord && collarRecord.pending_new_id) {
        pendingConfig = { new_id: collarRecord.pending_new_id };
      }
    } else {
      // Known collar - check if it exists, create if not
      const collarResult = await pool.query(
        'SELECT * FROM "Collars" WHERE collar_id = $1',
        [data.collar_id]
      );

      if (collarResult.rowCount === 0) {
        // First time seeing this collar ID - register it
        await pool.query(
          'INSERT INTO "Collars" (collar_id, status, last_seen, alert_state) VALUES ($1, $2, $3, $4)',
          [data.collar_id, 'active', new Date(data.timestamp), data.alert_state || 'safe']
        );
      } else {
        // Update last_seen, alert_state and check for pending config
        const collar = collarResult.rows[0];
        await pool.query(
          'UPDATE "Collars" SET last_seen = $1, alert_state = $2 WHERE collar_id = $3',
          [new Date(data.timestamp), data.alert_state || collar.alert_state || 'safe', data.collar_id]
        );

        // If there's a pending new ID, include it in response
        if (collar.pending_new_id) {
          pendingConfig = { new_id: collar.pending_new_id };
        }
      }
    }

    // Update the in-memory store for real-time updates
    latestCollarData.set(data.collar_id, {
      ...data,
      activity: null, // Activity will be computed server-side
      alert_state: data.alert_state || 'safe'
    });

    // Insert into location history
    const historyQuery = `
      INSERT INTO "LocationHistory" 
      (timestamp, collar_id, latitude, longitude, battery_voltage, body_temp, 
       env_temp, env_humidity, roll, pitch, yaw, activity, heart_rate, spo2)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
      null, // Activity computed server-side, not from collar
      data.heart_rate || null,
      data.spo2 || null,
    ]);

    // Response includes pending config if any
    const response = {
      message: 'Data ingested successfully',
      collar_id: data.collar_id
    };

    if (pendingConfig) {
      response.pending_config = pendingConfig;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error ingesting data:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Confirm that collar received new ID (BeagleBone calls after successful transmission)
app.post('/api/collars/:oldId/confirm-new-id', async (req, res) => {
  const oldId = parseInt(req.params.oldId, 10);
  const { new_id } = req.body;

  try {
    // Find the collar with this pending_new_id and update it
    const result = await pool.query(`
      UPDATE "Collars"
      SET collar_id = $1,
          pending_new_id = NULL
      WHERE collar_id = $2 AND pending_new_id = $1
      RETURNING *
    `, [new_id, oldId]);

    if (result.rowCount === 0) {
      return res.status(404).send({ error: 'Collar or pending config not found' });
    }

    res.status(200).json({ message: 'Collar ID updated successfully', collar: result.rows[0] });
  } catch (error) {
    console.error('Error confirming new collar ID:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Get latest collar data for frontend
app.get('/api/collars/latest', async (req, res) => {
  try {
    // Enrich with cattle info from database
    const dataArray = Array.from(latestCollarData.values());

    // Get collar-cattle mapping including alert_state
    const collarResult = await pool.query(`
      SELECT col.collar_id, c.name as cattle_name, c.tag_number,
             col.status, col.cattle_id, col.alert_state
      FROM "Collars" col
      LEFT JOIN "Cattle" c ON col.cattle_id = c.id
    `);

    const collarMap = new Map();
    collarResult.rows.forEach(row => collarMap.set(row.collar_id, row));

    // Enrich data with cattle info and alert_state
    const enrichedData = dataArray.map(data => {
      const collarInfo = collarMap.get(data.collar_id);
      return {
        ...data,
        cattle_name: collarInfo?.cattle_name || null,
        tag_number: collarInfo?.tag_number || null,
        collar_status: collarInfo?.status || 'unknown',
        alert_state: data.alert_state || collarInfo?.alert_state || 'safe'
      };
    });

    res.status(200).json(enrichedData);
  } catch (error) {
    console.error('Error fetching latest collar data:', error);
    // Fallback to basic data
    const dataArray = Array.from(latestCollarData.values());
    res.status(200).json(dataArray);
  }
});

// =============================================
// HEALTH THRESHOLDS
// =============================================

app.get('/api/health/thresholds', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "HealthThresholds"');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching health thresholds:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// =============================================
// DASHBOARD SUMMARY
// =============================================

app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const [cattleCount, collarStats, fenceCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM "Cattle"'),
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'active') as active_collars,
          COUNT(*) FILTER (WHERE status = 'unassigned' OR status = 'discovered') as unassigned_collars,
          COUNT(*) FILTER (WHERE status = 'inactive') as inactive_collars
        FROM "Collars"
        WHERE collar_id != $1
      `, [UNASSIGNED_COLLAR_ID]),
      pool.query('SELECT COUNT(*) FROM "Fences"')
    ]);

    res.status(200).json({
      total_cattle: parseInt(cattleCount.rows[0].count),
      active_collars: parseInt(collarStats.rows[0].active_collars) || 0,
      unassigned_collars: parseInt(collarStats.rows[0].unassigned_collars) || 0,
      total_fences: parseInt(fenceCount.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
