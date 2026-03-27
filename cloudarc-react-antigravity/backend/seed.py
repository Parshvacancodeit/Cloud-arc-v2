"""
CloudArc Seed Script
Populates the database with demo data for a ready-to-demo experience.

Usage: python seed.py  (run from inside backend/ directory)
Demo credentials: demo@cloudarc.com / demo1234
"""
import sqlite3
import json
import os
import sys
from datetime import datetime, timedelta
import random

# Bootstrap Flask app context so we can reuse the DB helpers
sys.path.insert(0, os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv()

from config import Config
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), Config.DATABASE)

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def run_schema(conn):
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    with open(schema_path) as f:
        conn.executescript(f.read())
    conn.commit()

def seed():
    conn = get_conn()
    run_schema(conn)

    # ── Check if already seeded ───────────────────────────────────
    existing = conn.execute("SELECT id FROM users WHERE email='demo@cloudarc.com'").fetchone()
    if existing:
        print("[Seed] Demo data already exists. Skipping.")
        conn.close()
        return

    print("[Seed] Creating demo data...")

    # ── User ─────────────────────────────────────────────────────
    pw_hash = generate_password_hash('demo1234')
    cur = conn.execute(
        "INSERT INTO users (email, password_hash, name) VALUES (?,?,?)",
        ['demo@cloudarc.com', pw_hash, 'Ravi Sharma']
    )
    user_id = cur.lastrowid

    # ── Restaurant ────────────────────────────────────────────────
    operating_hours = {
        "monday":    {"open": "09:00", "close": "22:00", "closed": False},
        "tuesday":   {"open": "09:00", "close": "22:00", "closed": False},
        "wednesday": {"open": "09:00", "close": "22:00", "closed": False},
        "thursday":  {"open": "09:00", "close": "22:00", "closed": False},
        "friday":    {"open": "09:00", "close": "23:00", "closed": False},
        "saturday":  {"open": "09:00", "close": "23:00", "closed": False},
        "sunday":    {"open": "10:00", "close": "22:00", "closed": False},
    }
    cur2 = conn.execute(
        '''INSERT INTO restaurants
           (user_id, name, owner_name, phone, email, city, pincode,
            business_type, cuisine_types, opening_time, closing_time,
            daily_order_capacity, avg_prep_time, min_order_value, delivery_radius,
            gst_number, fssai_license, address, state,
            order_notifications, email_notifications, low_stock_alerts, peak_hour_reminders,
            zomato_connected, swiggy_connected, operating_hours)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        [
            user_id, 'Spice Garden Cloud Kitchen', 'Ravi Sharma',
            '+91 98765 43210', 'demo@cloudarc.com',
            'Mumbai', '400001',
            'cloud-kitchen',
            json.dumps(['Indian', 'North Indian', 'Chinese']),
            '09:00', '23:00', '30-100',
            18, 150, 8,
            'GST29ABCDE1234F1Z5', 'FSSAI12345678901234',
            '42, Food Street, Andheri West', 'Maharashtra',
            1, 1, 1, 1,
            1, 1,
            json.dumps(operating_hours)
        ]
    )
    rid = cur2.lastrowid

    # ── Menu Items ────────────────────────────────────────────────
    menu_items = [
        ('Butter Chicken', 'Main Course', 320, 'Rich creamy tomato sauce with tender chicken', 20, 1, 0, 1, ['Zomato', 'Swiggy']),
        ('Dal Makhani', 'Main Course', 220, 'Slow-cooked black lentils with butter and cream', 25, 1, 1, 1, ['Zomato', 'Swiggy', 'Direct']),
        ('Paneer Tikka', 'Starters', 280, 'Marinated cottage cheese grilled in tandoor', 15, 1, 1, 0, ['Zomato', 'Direct']),
        ('Chicken Biryani', 'Rice', 360, 'Aromatic basmati rice with spiced chicken', 30, 1, 0, 1, ['Zomato', 'Swiggy', 'Uber Eats']),
        ('Veg Fried Rice', 'Rice', 180, 'Stir-fried rice with fresh vegetables', 12, 1, 1, 0, ['Swiggy', 'Direct']),
        ('Chicken Manchurian', 'Starters', 260, 'Crispy chicken in tangy Manchurian sauce', 18, 1, 0, 0, ['Zomato', 'Swiggy']),
        ('Garlic Naan', 'Bread', 60, 'Soft flatbread with garlic butter', 8, 1, 1, 0, ['Zomato', 'Swiggy', 'Direct']),
        ('Gulab Jamun', 'Desserts', 120, 'Soft milk-solid dumplings in rose syrup', 5, 1, 1, 0, ['Zomato', 'Direct']),
        ('Mango Lassi', 'Beverages', 90, 'Refreshing mango yogurt drink', 3, 1, 1, 0, ['Zomato', 'Swiggy', 'Direct']),
        ('Chicken Tandoori', 'Starters', 320, 'Half chicken marinated in yogurt and spices', 25, 1, 0, 1, ['Zomato', 'Swiggy', 'Uber Eats']),
        ('Chole Bhature', 'Breakfast', 160, 'Spiced chickpeas with fluffy fried bread', 15, 1, 1, 0, ['Direct']),
        ('Raita', 'Sides', 60, 'Cooling yogurt with cucumber and spices', 3, 1, 1, 0, ['Zomato', 'Direct']),
    ]
    menu_ids = []
    for (name, category, price, desc, prep, avail, veg, best, platforms) in menu_items:
        cur = conn.execute(
            '''INSERT INTO menu_items
               (restaurant_id, name, category, price, description, prep_time,
                is_available, is_veg, is_bestseller, platforms, image_url)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
            [rid, name, category, price, desc, prep,
             avail, veg, best, json.dumps(platforms), '']
        )
        menu_ids.append((cur.lastrowid, name, price))

    # ── Team Members ──────────────────────────────────────────────
    team = [
        ('Amit Kumar',   'Head Chef',  'amit@example.com',   '+91 87654 32109', 'Station 1', 'Morning',  'active', ['orders', 'menu', 'inventory']),
        ('Priya Singh',  'Manager',    'priya@example.com',  '+91 76543 21098', 'All',        'Full Day', 'active', ['orders', 'menu', 'team', 'analytics', 'settings']),
        ('Rahul Verma',  'Line Cook',  'rahul@example.com',  '+91 65432 10987', 'Station 2', 'Evening',  'active', ['orders']),
        ('Sneha Patel',  'Delivery',   'sneha@example.com',  '+91 54321 09876', 'Station 3', 'Morning',  'active', ['orders']),
    ]
    for (name, role, email, phone, station, shift, status, perms) in team:
        conn.execute(
            '''INSERT INTO team_members
               (restaurant_id, name, role, email, phone, station, shift, status, permissions)
               VALUES (?,?,?,?,?,?,?,?,?)''',
            [rid, name, role, email, phone, station, shift, status, json.dumps(perms)]
        )

    # ── Orders (last 10 days) ─────────────────────────────────────
    platforms = ['Zomato', 'Swiggy', 'Uber Eats', 'Direct']
    customers = [
        ('Aisha Khan',     '+91 99887 76655', '12 Marine Lines, Mumbai'),
        ('Rajesh Nair',    '+91 88776 65544', '34 Bandra West, Mumbai'),
        ('Pooja Iyer',     '+91 77665 54433', '56 Powai, Mumbai'),
        ('Suresh Gupta',   '+91 66554 43322', '78 Andheri East, Mumbai'),
        ('Meena Reddy',    '+91 55443 32211', '90 Juhu, Mumbai'),
        ('Kiran Shah',     '+91 44332 21100', '23 Dadar, Mumbai'),
        ('Divya Menon',    '+91 33221 10099', '45 Kurla, Mumbai'),
    ]
    statuses = ['received', 'received', 'preparing', 'preparing', 'ready', 'dispatched', 'dispatched']
    order_counter = 1001

    for i in range(14):
        # Spread over last 10 days with more today
        days_ago = random.choices([0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9], k=1)[0]
        hours_ago = random.randint(0, 22)
        order_dt = (datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)).strftime('%Y-%m-%d %H:%M:%S')

        platform = random.choice(platforms)
        cust = random.choice(customers)
        status = random.choice(statuses)
        priority = random.choice(['normal', 'normal', 'normal', 'high', 'urgent'])

        # Pick 1-3 random menu items
        n_items = random.randint(1, 3)
        chosen = random.sample(menu_ids, min(n_items, len(menu_ids)))
        items = [{'qty': random.randint(1, 2), 'name': m[1], 'price': m[2]} for m in chosen]
        total = sum(i['qty'] * i['price'] for i in items)
        order_number = f"CA-{order_counter}"
        order_counter += 1

        conn.execute(
            '''INSERT INTO orders
               (restaurant_id, order_number, platform, status, priority,
                customer_name, customer_phone, customer_address,
                items, total_amount, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
            [rid, order_number, platform, status, priority,
             cust[0], cust[1], cust[2],
             json.dumps(items), round(total, 2), order_dt, order_dt]
        )

    # ── Alerts ────────────────────────────────────────────────────
    alerts = [
        ('Welcome to CloudArc! 🎉', 'Your kitchen is set up and ready. Add more menu items to get started!', 'success'),
        ('New Zomato orders incoming', '3 orders received from Zomato in the last hour.', 'info'),
        ('Peak hour approaching', 'Lunch rush expected in 30 minutes. Prep your stations!', 'warning'),
    ]
    for (title, msg, atype) in alerts:
        conn.execute(
            "INSERT INTO alerts (restaurant_id, title, message, type) VALUES (?,?,?,?)",
            [rid, title, msg, atype]
        )

    conn.commit()
    conn.close()
    print(f"[Seed] ✅ Demo data created!")
    print(f"[Seed]    Restaurant ID : {rid}")
    print(f"[Seed]    Login email   : demo@cloudarc.com")
    print(f"[Seed]    Password      : demo1234")
    print(f"[Seed]    Seeded        : {len(menu_items)} menu items, {len(team)} team members, 14 orders, {len(alerts)} alerts")


if __name__ == '__main__':
    seed()
