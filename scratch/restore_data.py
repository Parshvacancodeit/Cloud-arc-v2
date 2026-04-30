import sqlite3
import os
import json
from datetime import datetime, timedelta
import random

base_dir = '/Users/parshvapatel/Desktop/Main-Cloudarc/cloudarc-react-antigravity/backend'
db_path = os.path.join(base_dir, 'cloudarc.db')
schema_path = os.path.join(base_dir, 'schema.sql')

# Delete malformed DB and start fresh
if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
with open(schema_path, 'r') as f:
    conn.executescript(f.read())

# ── 1. USERS & CUSTOMERS ──────────────────────────────────────────
users = [
    ('spicekitchen@gmail.com', 'scrypt:32768:8:1$MEbGNe0NBXjkn17b$139bbb99ca02536f9481b431d3452fa816ac61fed77b9fde144906c851e48d96284ba5b078ea6ef147056207dda8e8703dae74320a8fdf55282c7a0feb0d3b7c', 'Parshva Patel'),
    ('ahmedabad@veg.com', 'scrypt:32768:8:1$emSUkJS62XWhPD0s$629fc7e4f98f279759379dd148c28c26728613828b5124135d18c61cf4a0fc898981b08f16e5da36742e4cab8258dfe17538d27ed423b2af8410d94006144c14', 'Jignesh Patel'),
    ('demo@cloudarc.com', 'scrypt:32768:8:1$CDVLPFZc5Hv7ND0O$6c0d5c00d3e4533bb3bdaa2ee9b740a8f3a7f9b9776bead0be24c82d135871b3dfea0166944c5cc3a6bac62749df7bbc41dd50b9220c613225762a741016e1ed', 'Ravi Sharma')
]
for email, pw, name in users:
    conn.execute("INSERT INTO users (email, password_hash, name) VALUES (?,?,?)", [email, pw, name])

customers = [
    ('parshva@gmail.com', 'scrypt:32768:8:1$MpuQCqFb0Uzbcclc$1f793b019fa6bc1271b2c5f83e2878c40e13037eedb9e27b7113b6b4ad51fe2f39b59c89075fb7ab93ce6cee886db277a6680254461db71f5a96ce8dd02eb1ed', 'Parshva'),
    ('mahesh@gmail.com', 'scrypt:32768:8:1$qr9n618IwU2pKGtt$d649b9f60be340bca354164e73fa9b94d0c06617cd0c6c825068230ec6cf15d0d03a3d3f414a887bf3ca833abce6cd6149d174396d67f142987d6dc58dd273ce', 'Mahesh Jindal'),
    ('ajay@gmail.com', 'scrypt:32768:8:1$ePZZECdwh6tnY0ju$8e498deb34d85ced4aa079bb57656e1b85634cf54a8012726b879f6915e5b0da71f57edad538907d5a268ce6db107b8e0971db6b96a688686e349d67cad7d70e', 'Ajay singh'),
    ('rahul@gmail.com', 'scrypt:32768:8:1$Vy25QVjmrLgVmZ63$58c1e54d42806d4ac543693fada22d30f75361212cd0070541333c997db67d129654fb13c4325f50bd9dcb48f52947182404d2c24834f99200fde096a9465d94', 'Rahul Sharma')
]
for email, pw, name in customers:
    conn.execute("INSERT INTO customers (email, password_hash, name) VALUES (?,?,?)", [email, pw, name])

# ── 2. RESTAURANTS ────────────────────────────────────────────────
u_spice = conn.execute("SELECT id FROM users WHERE email='spicekitchen@gmail.com'").fetchone()[0]
u_veg   = conn.execute("SELECT id FROM users WHERE email='ahmedabad@veg.com'").fetchone()[0]
u_demo  = conn.execute("SELECT id FROM users WHERE email='demo@cloudarc.com'").fetchone()[0]

restaurants = [
    (u_spice, 'Spice Kitchen', 'Parshva Patel', '8780328197', 'spicekitchen@gmail.com', 'Ahmedabad', '380060', '["South Indian"]'),
    (u_veg, 'Ahmedabad Veg Delights', 'Jignesh Patel', '+91 91234 56789', 'ahmedabad@veg.com', 'Ahmedabad', '380060', '["Gujarati", "North Indian", "Street Food"]'),
    (u_demo, 'Spice Garden Cloud Kitchen', 'Ravi Sharma', '+91 98765 43210', 'demo@cloudarc.com', 'Mumbai', '400001', '["Indian", "North Indian", "Chinese"]')
]
for uid, name, owner, phone, email, city, pincode, cuisines in restaurants:
    conn.execute('''INSERT INTO restaurants (user_id, name, owner_name, phone, email, city, pincode, cuisine_types) 
                    VALUES (?,?,?,?,?,?,?,?)''', [uid, name, owner, phone, email, city, pincode, cuisines])

rid_spice = conn.execute("SELECT id FROM restaurants WHERE name='Spice Kitchen'").fetchone()[0]
rid_veg   = conn.execute("SELECT id FROM restaurants WHERE name='Ahmedabad Veg Delights'").fetchone()[0]
rid_demo  = conn.execute("SELECT id FROM restaurants WHERE name='Spice Garden Cloud Kitchen'").fetchone()[0]

# ── 3. MENU ITEMS ─────────────────────────────────────────────────
menu_items_pool = [
    (rid_veg, 'Paneer Tikka Platter', 'Starters', 299, 1),
    (rid_veg, 'Amrit-Sari Dal Makhani', 'Main Course', 249, 1),
    (rid_veg, 'Garlic Butter Naan', 'Breads', 65, 1),
    (rid_veg, 'Veg Hyderabadi Biryani', 'Rice', 349, 1),
    (rid_veg, 'Classic Kesar Lassi', 'Beverages', 99, 1),
    (rid_spice, 'Mysore Masala Dosa', 'South Indian', 250, 1),
    (rid_spice, 'Manchurian', 'Chinese', 190, 0)
]
for rid, name, cat, price, is_veg in menu_items_pool:
    conn.execute("INSERT INTO menu_items (restaurant_id, name, category, price, is_veg) VALUES (?,?,?,?,?)", 
                 [rid, name, cat, price, is_veg])

# ── 4. REALISTIC ORDERS FOR ANALYTICS ─────────────────────────────
platforms = ['Direct', 'CloudArc App', 'Zomato', 'Swiggy', 'Partner App']
names = ['Parshva', 'Mahesh', 'Ajay', 'Rahul', 'Sneha', 'Amit', 'Priya']

# Generate 50 orders over the last 30 days
for i in range(50):
    rid = rid_veg if i % 1.5 == 0 else rid_spice
    plat = random.choice(platforms)
    cust = random.choice(names)
    
    # Spread throughout the last 30 days
    days_ago = random.randint(0, 30)
    # Spread throughout the day (Peak hours: 12-14 and 19-22)
    if random.random() > 0.5:
        hour = random.randint(19, 22)
    else:
        hour = random.randint(11, 23)
    
    dt = (datetime.now() - timedelta(days=days_ago)).replace(hour=hour, minute=random.randint(0,59)).strftime('%Y-%m-%d %H:%M:%S')
    
    # Add 1-3 items per order
    order_items = []
    total = 0
    num_items = random.randint(1, 3)
    for _ in range(num_items):
        pool = [it for it in menu_items_pool if it[0] == rid]
        it = random.choice(pool)
        qty = random.randint(1, 2)
        order_items.append({'name': it[1], 'qty': qty, 'price': it[3]})
        total += qty * it[3]
    
    status = 'completed' if days_ago > 0 else random.choice(['received', 'preparing', 'ready', 'completed'])
    
    conn.execute('''INSERT INTO orders 
                    (restaurant_id, order_number, customer_name, total_amount, status, platform, items, created_at, updated_at) 
                    VALUES (?,?,?,?,?,?,?,?,?)''', 
                 [rid, f'CA-{random.randint(1000,9999)}', cust, total, status, plat, json.dumps(order_items), dt, dt])

conn.commit()
conn.close()
print("✅ Fully Realistic Analytics Data restored successfully.")
