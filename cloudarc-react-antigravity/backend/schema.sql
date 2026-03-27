-- CloudArc Database Schema
-- SQLite — runs anywhere, no server needed

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ──────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name        TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ──────────────────────────────────────────────
-- RESTAURANTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id              INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                 TEXT NOT NULL,
    owner_name           TEXT NOT NULL DEFAULT '',
    phone                TEXT NOT NULL DEFAULT '',
    email                TEXT NOT NULL DEFAULT '',
    address              TEXT NOT NULL DEFAULT '',
    city                 TEXT NOT NULL DEFAULT '',
    state                TEXT NOT NULL DEFAULT '',
    pincode              TEXT NOT NULL DEFAULT '',
    business_type        TEXT NOT NULL DEFAULT 'cloud-kitchen',
    cuisine_types        TEXT NOT NULL DEFAULT '[]',  -- JSON array
    opening_time         TEXT NOT NULL DEFAULT '09:00',
    closing_time         TEXT NOT NULL DEFAULT '23:00',
    daily_order_capacity TEXT NOT NULL DEFAULT '10-30',
    avg_prep_time        INTEGER NOT NULL DEFAULT 18,
    min_order_value      INTEGER NOT NULL DEFAULT 0,
    delivery_radius      INTEGER NOT NULL DEFAULT 5,
    gst_number           TEXT NOT NULL DEFAULT '',
    fssai_license        TEXT NOT NULL DEFAULT '',
    is_active            INTEGER NOT NULL DEFAULT 1,
    -- Notification prefs
    order_notifications  INTEGER NOT NULL DEFAULT 1,
    email_notifications  INTEGER NOT NULL DEFAULT 1,
    sms_notifications    INTEGER NOT NULL DEFAULT 0,
    low_stock_alerts     INTEGER NOT NULL DEFAULT 1,
    peak_hour_reminders  INTEGER NOT NULL DEFAULT 1,
    -- Platform integrations
    zomato_connected     INTEGER NOT NULL DEFAULT 0,
    swiggy_connected     INTEGER NOT NULL DEFAULT 0,
    uber_eats_connected  INTEGER NOT NULL DEFAULT 0,
    -- Operating hours (JSON map)
    operating_hours      TEXT NOT NULL DEFAULT '{}',
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ──────────────────────────────────────────────
-- MENU ITEMS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    category      TEXT NOT NULL DEFAULT '',
    price         REAL NOT NULL DEFAULT 0,
    description   TEXT NOT NULL DEFAULT '',
    prep_time     INTEGER NOT NULL DEFAULT 15,
    is_available  INTEGER NOT NULL DEFAULT 1,
    is_veg        INTEGER NOT NULL DEFAULT 1,
    is_bestseller INTEGER NOT NULL DEFAULT 0,
    platforms     TEXT NOT NULL DEFAULT '[]',  -- JSON array
    image_url     TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ──────────────────────────────────────────────
-- ORDERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id    INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_number     TEXT NOT NULL,
    platform         TEXT NOT NULL DEFAULT 'Direct',
    status           TEXT NOT NULL DEFAULT 'received'
                        CHECK(status IN ('received','preparing','ready','dispatched','completed','cancelled')),
    priority         TEXT NOT NULL DEFAULT 'normal'
                        CHECK(priority IN ('low','normal','high','urgent')),
    customer_name    TEXT NOT NULL DEFAULT '',
    customer_phone   TEXT NOT NULL DEFAULT '',
    customer_address TEXT NOT NULL DEFAULT '',
    items            TEXT NOT NULL DEFAULT '[]',  -- JSON array [{qty, name, price}]
    total_amount     REAL NOT NULL DEFAULT 0,
    notes            TEXT NOT NULL DEFAULT '',
    assigned_to      TEXT NOT NULL DEFAULT '',
    customer_id      INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ──────────────────────────────────────────────
-- TEAM MEMBERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT '',
    email         TEXT NOT NULL DEFAULT '',
    phone         TEXT NOT NULL DEFAULT '',
    station       TEXT NOT NULL DEFAULT '',
    shift         TEXT NOT NULL DEFAULT 'Morning',
    status        TEXT NOT NULL DEFAULT 'active'
                    CHECK(status IN ('active','inactive')),
    joined_date   TEXT NOT NULL DEFAULT (date('now')),
    permissions   TEXT NOT NULL DEFAULT '[]',  -- JSON array of permission ids
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ──────────────────────────────────────────────
-- CUSTOMERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    phone         TEXT NOT NULL DEFAULT '',
    address       TEXT NOT NULL DEFAULT '',
    pincode       TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ──────────────────────────────────────────────
-- ALERTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    message       TEXT NOT NULL DEFAULT '',
    type          TEXT NOT NULL DEFAULT 'info'
                    CHECK(type IN ('info','warning','success','error')),
    is_read       INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
