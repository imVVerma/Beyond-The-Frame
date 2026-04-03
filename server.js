require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Create table if it doesn't exist
const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database', err);
  }
};

initDb();

// API Endpoints
app.post('/api/feedback', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const queryText = 'INSERT INTO feedback(name, email, message) VALUES($1, $2, $3) RETURNING *';
    const values = [name, email, message];
    const result = await pool.query(queryText, values);
    res.status(201).json({ message: 'Feedback stored successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Error inserting feedback', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
