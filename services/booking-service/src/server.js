const express  = require('express');
const { MongoClient } = require('mongodb');
const redis    = require('redis');
const jwt      = require('jsonwebtoken');
const cors     = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'booking-service', port: 3003 })
);

// ── MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const mongoClient = new MongoClient(MONGO_URL);
let ordersDb;
mongoClient.connect().then(() => {
  ordersDb = mongoClient.db('cloudstay');
  console.log('[booking-service] MongoDB connected');
});

// ── Redis connection
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const redisClient = redis.createClient({ url: REDIS_URL });
redisClient.connect().then(() =>
  console.log('[booking-service] Redis connected')
);

// ── PASTE your /api/cart routes here ─────────────────
app.get('/api/cart/:userId', async (req, res) => {
  // copy from server.js.monolith
});
app.post('/api/cart/:userId/items', async (req, res) => {
  // copy from server.js.monolith
});

// ── PASTE your /api/orders routes here ───────────────
app.post('/api/bookings', async (req, res) => {
  // copy from server.js.monolith
});
app.get('/api/bookings/user/:userId', async (req, res) => {
  // copy from server.js.monolith
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () =>
  console.log(`[order-service] Running on http://localhost:${PORT}`)
);