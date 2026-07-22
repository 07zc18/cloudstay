const express = require('express');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── Health check endpoint (required for Docker Compose)
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'user-service', port: 3001 })
);

// ── MySQL connection (users DB only)
const db = mysql.createPool({
  host:     process.env.MYSQL_HOST     || 'db',
  user:     process.env.MYSQL_USER     || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'cloudstay_db',
});

// ── PASTE your /api/auth/register route here ──────────
app.post('/api/auth/register', async (req, res) => {
  // copy from server.js.monolith
});

// ── PASTE your /api/auth/login route here ─────────────
app.post('/api/auth/login', async (req, res) => {
  // copy from server.js.monolith
});

// ── PASTE your /api/users/:id route here ──────────────
app.get('/api/users/:id', async (req, res) => {
  // copy from server.js.monolith
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`[user-service] Running on http://localhost:${PORT}`)
);