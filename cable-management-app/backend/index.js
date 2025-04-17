const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// הוספת כבל חדש
app.post('/api/cables', async (req, res) => {
  const { outlet_name, type, location, status } = req.body;
  try {
    // בדיקת שם שקע כפול
    const checkQuery = 'SELECT * FROM cables WHERE outlet_name = $1';
    const checkResult = await pool.query(checkQuery, [outlet_name]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'שם השקע כבר קיים' });
    }

    const insertQuery = `
      INSERT INTO cables (outlet_name, type, location, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [outlet_name, type, location, status]);
    res.status(201).json({ message: 'הכבל נוסף בהצלחה', cable: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// שליפת כל הכבלים
app.get('/api/cables', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cables');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// יצירת חיבור בין כבלים
app.post('/api/connections', async (req, res) => {
  const { cable1_id, cable2_id } = req.body;
  try {
    // בדיקה אם החיבור כבר קיים
    const checkQuery = `
      SELECT * FROM connections
      WHERE (cable1_id = $1 AND cable2_id = $2) OR (cable1_id = $2 AND cable2_id = $1)
    `;
    const checkResult = await pool.query(checkQuery, [cable1_id, cable2_id]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'החיבור כבר קיים' });
    }

    // בדיקה אם הכבלים קיימים
    const cableCheckQuery = 'SELECT * FROM cables WHERE id IN ($1, $2)';
    const cableCheckResult = await pool.query(cableCheckQuery, [cable1_id, cable2_id]);
    if (cableCheckResult.rows.length !== 2) {
      return res.status(400).json({ error: 'אחד הכבלים או שניהם אינם קיימים' });
    }

    const insertQuery = `
      INSERT INTO connections (cable1_id, cable2_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [cable1_id, cable2_id]);
    res.status(201).json({ message: 'החיבור נוצר בהצלחה', connection: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// שליפת כל החיבורים
app.get('/api/connections', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c1.outlet_name AS cable1_name, c2.outlet_name AS cable2_name
      FROM connections c
      JOIN cables c1 ON c.cable1_id = c1.id
      JOIN cables c2 ON c.cable2_id = c2.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`השרת רץ על פורט ${PORT}`));