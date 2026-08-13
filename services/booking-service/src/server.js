const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ================================
// HEALTH CHECK
// ================================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'booking-service',
        port: 3003
    });
});

// ================================
// MYSQL DATABASE CONNECTION
// ================================
const db = mysql.createPool({
    host: process.env.MYSQL_HOST || 'db',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'cloudstay_db'
});

// ================================
// CREATE BOOKING
// ================================
app.post('/api/bookings', async (req, res) => {

    try {

        const {
            user_id,
            room_id,
            check_in,
            check_out,
            total_amount,
            special_request
        } = req.body;

        if (
            !user_id ||
            !room_id ||
            !check_in ||
            !check_out ||
            total_amount === undefined
        ) {
            return res.status(400).json({
                error: 'user_id, room_id, check_in, check_out and total_amount are required'
            });
        }

        // Check user exists
        const [users] = await db.query(
            'SELECT id FROM users WHERE id = ?',
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Check room exists
        const [rooms] = await db.query(
            'SELECT id FROM rooms WHERE id = ?',
            [room_id]
        );

        if (rooms.length === 0) {
            return res.status(404).json({
                error: 'Room not found'
            });
        }

        // Insert booking
        const [result] = await db.query(
            `INSERT INTO bookings
            (user_id, room_id, check_in, check_out,
             total_amount, status, special_request)
            VALUES (?, ?, ?, ?, ?, 'confirmed', ?)`,
            [
                user_id,
                room_id,
                check_in,
                check_out,
                total_amount,
                special_request || null
            ]
        );

        res.status(201).json({
            message: 'Booking created successfully',
            booking_id: result.insertId
        });

    } catch (error) {

        console.error('Booking creation error:', error.message);

        res.status(500).json({
            error: error.message
        });
    }
});

// ================================
// GET BOOKINGS FOR USER
// ================================
app.get('/api/bookings/user/:userId', async (req, res) => {

    try {

        const [rows] = await db.query(
            `SELECT
                b.id,
                b.user_id,
                b.room_id,
                b.check_in,
                b.check_out,
                b.total_amount,
                b.status,
                b.special_request,
                b.created_at,
                b.updated_at,
                r.room_type,
                r.price
             FROM bookings b
             JOIN rooms r ON b.room_id = r.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [req.params.userId]
        );

        res.json(rows);

    } catch (error) {

        console.error('Booking fetch error:', error.message);

        res.status(500).json({
            error: error.message
        });
    }
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(
        `[booking-service] Running on http://localhost:${PORT}`
    );
});