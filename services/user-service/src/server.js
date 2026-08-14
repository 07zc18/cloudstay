const express = require('express');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SALT_ROUNDS = 10; // 2^10 = 1024 rounds — never go below 10
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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

// ================================
// REGISTER
// ================================
app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name, phone } = req.body;

  // Input validation
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // Hash the password — plain text password is discarded after this
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)',
      [email, password_hash, full_name, phone || null]
    );

    res.status(201).json({
      message: 'Account created successfully',
      userId:  result.insertId
    });

  } catch (err) {
    // ER_DUP_ENTRY: email already registered (UNIQUE constraint)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ================================
// LOGIN
// ================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = ?',
      [email]
    );

    // Same error message for "not found" and "wrong password"
    // (prevents email enumeration attacks)
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // bcrypt.compare re-hashes the submitted password and compares —
    // it does NOT decrypt the stored hash
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Issue a JWT so Booking Service calls can be authenticated later
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message:  'Login successful',
      token,
      userId:   user.id,
      fullName: user.full_name,
      email:    user.email
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ================================
// GET USER BY ID
// ================================
app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, full_name, phone, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('User fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`[user-service] Running on http://localhost:${PORT}`)
);