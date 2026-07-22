-- ============================================================
-- CloudStay Hotel Booking System
-- MySQL Database Initialization
-- ============================================================

USE cloudstay_db;

-- ============================================================
-- USERS TABLE
-- Used by user-service
-- ============================================================

CREATE TABLE IF NOT EXISTS users (

    id INT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    full_name VARCHAR(255) NOT NULL,

    phone VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email)

);

-- ============================================================
-- ROOMS TABLE
-- Used by room-service
-- ============================================================

CREATE TABLE IF NOT EXISTS rooms (

    id INT AUTO_INCREMENT PRIMARY KEY,

    room_number VARCHAR(20) UNIQUE NOT NULL,

    room_type VARCHAR(100) NOT NULL,

    category VARCHAR(100) NOT NULL,

    capacity INT DEFAULT 2,

    price DECIMAL(10,2) NOT NULL,

    description TEXT,

    status ENUM(
        'Available',
        'Occupied',
        'Maintenance'
    ) DEFAULT 'Available',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- ============================================================
-- BOOKINGS TABLE
-- Used by booking-service
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    room_id INT NOT NULL,

    check_in DATE NOT NULL,

    check_out DATE NOT NULL,

    total_amount DECIMAL(10,2) NOT NULL,

    status ENUM(
        'pending',
        'confirmed',
        'checked_in',
        'completed',
        'cancelled'
    ) DEFAULT 'confirmed',

    special_request TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON DELETE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_status (status)

);

-- ============================================================
-- SAMPLE USERS
-- Password is only a placeholder hash for demonstration.
-- ============================================================

INSERT IGNORE INTO users
(
    id,
    email,
    password_hash,
    full_name,
    phone
)
VALUES

(
    1,
    'john@example.com',
    '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567890',
    'John Tan',
    '0123456789'
);

-- ============================================================
-- SAMPLE ROOMS
-- ============================================================

INSERT IGNORE INTO rooms
(
    id,
    room_number,
    room_type,
    category,
    capacity,
    price,
    description,
    status
)
VALUES

(
    1,
    '101',
    'Standard Room',
    'Standard',
    2,
    150.00,
    'Comfortable room with queen bed and basic facilities.',
    'Available'
),

(
    2,
    '102',
    'Deluxe Room',
    'Deluxe',
    3,
    250.00,
    'Spacious room with balcony and city view.',
    'Available'
),

(
    3,
    '201',
    'Suite Room',
    'Suite',
    4,
    500.00,
    'Luxury suite with separate living area.',
    'Occupied'
),

(
    4,
    '202',
    'Family Room',
    'Family',
    5,
    350.00,
    'Large family room with multiple beds.',
    'Available'
);

-- ============================================================
-- SAMPLE BOOKINGS
-- ============================================================

INSERT IGNORE INTO bookings
(
    id,
    user_id,
    room_id,
    check_in,
    check_out,
    total_amount,
    status,
    special_request
)
VALUES

(
    1,
    1,
    2,
    '2026-07-25',
    '2026-07-27',
    500.00,
    'confirmed',
    'Late check-in requested'
);

-- ============================================================
-- VERIFY TABLES
-- ============================================================

SHOW TABLES;