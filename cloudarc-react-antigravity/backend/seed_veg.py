"""
CloudArc Seed Script - Ahmedabad Veg Delights
Adds a vegetarian-only restaurant with pincode 380060.
"""
import sqlite3
import json
import os
import sys
from datetime import datetime
from werkzeug.security import generate_password_hash

# Path to DB
DB_PATH = os.path.join(os.path.dirname(__file__), 'cloudarc.db')

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def seed():
    conn = get_conn()
    
    # 1. Create User
    email = 'ahmedabad@veg.com'
    pw_hash = generate_password_hash('veg123')
    cur = conn.execute(
        "INSERT INTO users (email, password_hash, name) VALUES (?,?,?)",
        [email, pw_hash, 'Jignesh Patel']
    )
    user_id = cur.lastrowid

    # 2. Create Restaurant
    operating_hours = {
        "monday":    {"open": "11:00", "close": "23:00", "closed": False},
        "tuesday":   {"open": "11:00", "close": "23:00", "closed": False},
        "wednesday": {"open": "11:00", "close": "23:00", "closed": False},
        "thursday":  {"open": "11:00", "close": "23:00", "closed": False},
        "friday":    {"open": "11:00", "close": "23:59", "closed": False},
        "saturday":  {"open": "11:00", "close": "23:59", "closed": False},
        "sunday":    {"open": "11:00", "close": "23:59", "closed": False},
    }
    
    cur2 = conn.execute(
        '''INSERT INTO restaurants 
           (user_id, name, owner_name, phone, email, city, pincode, 
            business_type, cuisine_types, opening_time, closing_time, 
            daily_order_capacity, avg_prep_time, min_order_value, delivery_radius,
            gst_number, fssai_license, address, state, operating_hours) 
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        [
            user_id, 'Ahmedabad Veg Delights', 'Jignesh Patel', 
            '+91 91234 56789', email, 'Ahmedabad', '380060', 
            'cloud-kitchen', json.dumps(['Gujarati', 'North Indian', 'Street Food']),
            '11:00', '23:59', '100+', 20, 200, 10,
            'GST24ABCDE5678F1Z2', 'FSSAI24321098765432',
            '101, Science City Road, Sola', 'Gujarat', json.dumps(operating_hours)
        ]
    )
    rid = cur2.lastrowid

    # 3. Create Menu Items (Only Veg)
    # Using real Unsplash images
    menu_items = [
        ('Paneer Tikka Platter', 'Starters', 299, 'Hand-tossed cottage cheese cubes marinated in premium hung curd and 12 secret spices, grilled in a traditional clay oven.', 18, 1, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800'),
        ('Amrit-Sari Dal Makhani', 'Main Course', 249, 'Whole black lentils simmered for 12 hours on low flame with cultured butter and fresh tomato purée.', 25, 1, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800'),
        ('Garlic Butter Naan', 'Breads', 65, 'Traditional refined flour bread topped with minced garlic and brushed with clarified Amul butter.', 10, 1, 'https://images.unsplash.com/photo-1601050690597-df056fb1ce24?q=80&w=800'),
        ('Veg Hyderabadi Biryani', 'Rice', 349, 'Slow-cooked (Dum) basmati rice layered with garden-fresh vegetables and caramelized onions. Served with Burani Raita.', 30, 1, 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800'),
        ('Peshawari Chole Bhature', 'Street Food', 189, 'Authentic spicy chickpeas served with two oversized, light-as-air fried breads and tangy mango pickle.', 20, 1, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800'),
        ('Angoori Gulab Jamun', 'Desserts', 129, 'Miniature milk-solid dumplings soaked in warm saffron-infused cardamom syrup.', 8, 1, 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=800'),
        ('Classic Kesar Lassi', 'Beverages', 99, 'Thick whisked yogurt flavored with high-grade Kashmiri saffron and crushed pistachios.', 5, 1, 'https://images.unsplash.com/photo-1571006682823-7463f10ef9f0?q=80&w=800'),
    ]

    for (name, cat, price, desc, prep, veg, img) in menu_items:
        conn.execute(
            '''INSERT INTO menu_items 
               (restaurant_id, name, category, price, description, prep_time, is_veg, image_url) 
               VALUES (?,?,?,?,?,?,?,?)''',
            [rid, name, cat, price, desc, prep, veg, img]
        )

    # 4. Create some test orders
    orders = [
        ('CA-V001', 'Swiggy', 'received', 'urgent', 'Rahul Mehta', '+91 90000 11111', 'Block B, Science City', [{'qty': 1, 'name': 'Paneer Tikka Platter', 'price': 299}, {'qty': 2, 'name': 'Garlic Butter Naan', 'price': 65}], 429),
        ('CA-V002', 'Direct', 'preparing', 'normal', 'Sneha Vyas', '+91 91111 22222', 'Apt 402, Satellite', [{'qty': 1, 'name': 'Veg Hyderabadi Biryani', 'price': 349}], 349),
    ]

    for (num, plat, status, prio, name, phone, addr, items, total) in orders:
        created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        accepted_at = created_at if status == 'preparing' else None
        conn.execute(
            '''INSERT INTO orders 
               (restaurant_id, order_number, platform, status, priority, 
                customer_name, customer_phone, customer_address, 
                items, total_amount, created_at, accepted_at) 
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
            [rid, num, plat, status, prio, name, phone, addr, json.dumps(items), total, created_at, accepted_at]
        )

    conn.commit()
    conn.close()
    print(f"✅ Created Ahmedabad Veg Delights (ID: {rid})")
    print(f"   Credentials: {email} / veg123")

if __name__ == '__main__':
    seed()
