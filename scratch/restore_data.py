import sqlite3
import os
import json
from datetime import datetime, timedelta

base_dir = '/Users/parshvapatel/Desktop/Main-Cloudarc/cloudarc-react-antigravity/backend'
db_path = os.path.join(base_dir, 'cloudarc.db')
schema_path = os.path.join(base_dir, 'schema.sql')

# Delete malformed DB and start fresh from schema
if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
with open(schema_path, 'r') as f:
    conn.executescript(f.read())

# ── 1. USERS ──────────────────────────────────────────────────────
users = [
    ('spicekitchen@gmail.com', 'scrypt:32768:8:1$MEbGNe0NBXjkn17b$139bbb99ca02536f9481b431d3452fa816ac61fed77b9fde144906c851e48d96284ba5b078ea6ef147056207dda8e8703dae74320a8fdf55282c7a0feb0d3b7c', 'Parshva Patel'),
    ('ahmedabad@veg.com', 'scrypt:32768:8:1$emSUkJS62XWhPD0s$629fc7e4f98f279759379dd148c28c26728613828b5124135d18c61cf4a0fc898981b08f16e5da36742e4cab8258dfe17538d27ed423b2af8410d94006144c14', 'Jignesh Patel'),
    ('demo@cloudarc.com', 'scrypt:32768:8:1$CDVLPFZc5Hv7ND0O$6c0d5c00d3e4533bb3bdaa2ee9b740a8f3a7f9b9776bead0be24c82d135871b3dfea0166944c5cc3a6bac62749df7bbc41dd50b9220c613225762a741016e1ed', 'Ravi Sharma')
]
for email, pw, name in users:
    conn.execute("INSERT INTO users (email, password_hash, name) VALUES (?,?,?)", [email, pw, name])

# ── 2. CUSTOMERS ──────────────────────────────────────────────────
customers = [
    ('parshva@gmail.com', 'scrypt:32768:8:1$MpuQCqFb0Uzbcclc$1f793b019fa6bc1271b2c5f83e2878c40e13037eedb9e27b7113b6b4ad51fe2f39b59c89075fb7ab93ce6cee886db277a6680254461db71f5a96ce8dd02eb1ed', 'Parshva'),
    ('mahesh@gmail.com', 'scrypt:32768:8:1$qr9n618IwU2pKGtt$d649b9f60be340bca354164e73fa9b94d0c06617cd0c6c825068230ec6cf15d0d03a3d3f414a887bf3ca833abce6cd6149d174396d67f142987d6dc58dd273ce', 'Mahesh Jindal'),
    ('ajay@gmail.com', 'scrypt:32768:8:1$ePZZECdwh6tnY0ju$8e498deb34d85ced4aa079bb57656e1b85634cf54a8012726b879f6915e5b0da71f57edad538907d5a268ce6db107b8e0971db6b96a688686e349d67cad7d70e', 'Ajay singh'),
    ('rahul@gmail.com', 'scrypt:32768:8:1$Vy25QVjmrLgVmZ63$58c1e54d42806d4ac543693fada22d30f75361212cd0070541333c997db67d129654fb13c4325f50bd9dcb48f52947182404d2c24834f99200fde096a9465d94', 'Rahul Sharma')
]
for email, pw, name in customers:
    conn.execute("INSERT INTO customers (email, password_hash, name) VALUES (?,?,?)", [email, pw, name])

# ── 3. RESTAURANTS ────────────────────────────────────────────────
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

# Get Restaurant IDs
rid_spice = conn.execute("SELECT id FROM restaurants WHERE name='Spice Kitchen'").fetchone()[0]
rid_veg   = conn.execute("SELECT id FROM restaurants WHERE name='Ahmedabad Veg Delights'").fetchone()[0]
rid_demo  = conn.execute("SELECT id FROM restaurants WHERE name='Spice Garden Cloud Kitchen'").fetchone()[0]

# ── 4. MENU ITEMS ─────────────────────────────────────────────────
# Ahmedabad Veg Delights
menu_veg = [
    ('Paneer Tikka Platter', 'Starters', 299, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800'),
    ('Amrit-Sari Dal Makhani', 'Main Course', 249, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800'),
    ('Garlic Butter Naan', 'Breads', 65, 'https://images.unsplash.com/photo-1601050690597-df056fb1ce24?q=80&w=800'),
    ('Veg Hyderabadi Biryani', 'Rice', 349, 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800'),
    ('Peshawari Chole Bhature', 'Street Food', 189, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800'),
    ('Angoori Gulab Jamun', 'Desserts', 129, 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=800'),
    ('Classic Kesar Lassi', 'Beverages', 99, 'https://images.unsplash.com/photo-1571006682823-7463f10ef9f0?q=80&w=800')
]
for name, cat, price, img in menu_veg:
    conn.execute("INSERT INTO menu_items (restaurant_id, name, category, price, image_url, is_veg) VALUES (?,?,?,?,?,1)", 
                 [rid_veg, name, cat, price, img])

# Spice Kitchen
menu_spice = [
    ('Mysore masala dosa', 'South Indian', 250, ''),
    ('Manchurian', 'Chinese', 190, 'http://127.0.0.1:5001/static/uploads/5d0315ede2224f6281d2b9a0b8ef76fa.webp')
]
for name, cat, price, img in menu_spice:
    conn.execute("INSERT INTO menu_items (restaurant_id, name, category, price, image_url) VALUES (?,?,?,?,?)", 
                 [rid_spice, name, cat, price, img])

# ── 5. ORDERS (The most important part for Analytics) ─────────────
# We'll create a mix of completed orders over the last 30 days
order_data = [
    # Veg Delights historical orders
    ('CA-WEHXNB', rid_veg, 'Mahesh Jindal', 897, 'completed', '2026-04-26 08:56:10'),
    ('CA-MPD1HZ', rid_veg, 'Rahul Sharma', 439, 'completed', '2026-04-26 08:54:19'),
    ('CA-OFCBB3', rid_veg, 'parshva', 396, 'completed', '2026-04-26 08:52:46'),
    ('CA-P4GYAC', rid_veg, 'parshva', 737, 'completed', '2026-04-26 07:33:18'),
    ('CA-BWS8VU', rid_veg, 'parshva', 65, 'completed', '2026-04-25 13:51:45'),
    ('CA-GEGN8X', rid_veg, 'parshva', 190, 'completed', '2026-04-25 13:34:40'),
    ('CA-N3WCHJ', rid_veg, 'parshva', 129, 'completed', '2026-04-25 06:05:11'),
    ('CA-MXMFOZ', rid_veg, 'Ajay singh', 357, 'completed', '2026-04-14 06:51:39'),
    ('CA-VJA9BF', rid_veg, 'parshva', 297, 'completed', '2026-04-14 06:38:55'),
    ('CA-91907H', rid_veg, 'parshva', 314, 'completed', '2026-04-14 06:32:29'),
    ('CA-8GWUG1', rid_veg, 'parshva', 478, 'completed', '2026-04-14 06:03:08'),
    ('CA-DSGNYO', rid_veg, 'parshva', 250, 'completed', '2026-04-13 16:47:29'),
    ('CA-5840', rid_veg, 'Parshva', 164, 'completed', '2026-03-28 08:28:40'),
    ('CA-5221', rid_veg, 'parshva', 398, 'completed', '2026-03-28 07:22:21'),
    ('CA-4640', rid_veg, 'Rahul Sharma', 129, 'completed', '2026-03-28 07:16:40'),
    ('CA-4012', rid_veg, 'Rahul Sharma', 488, 'completed', '2026-03-28 07:10:12'),
    ('CA-3417', rid_veg, 'Rahul Sharma', 478, 'completed', '2026-03-28 07:04:17'),
    ('CA-1822', rid_veg, 'Rahul Sharma', 250, 'completed', '2026-03-28 06:48:22')
]

for num, rid, cust, total, status, dt in order_data:
    conn.execute('''INSERT INTO orders 
                    (restaurant_id, order_number, customer_name, total_amount, status, created_at, updated_at, items) 
                    VALUES (?,?,?,?,?,?,?,?)''', 
                 [rid, num, cust, total, status, dt, dt, '[]'])

# Generate some random orders for the last 7 days to fill up charts
for i in range(20):
    rid = rid_veg if i % 2 == 0 else rid_spice
    days_ago = i % 7
    dt = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
    total = 200 + (i * 10)
    conn.execute('''INSERT INTO orders 
                    (restaurant_id, order_number, customer_name, total_amount, status, created_at, updated_at, items) 
                    VALUES (?,?,?,?,?,?,?,?)''', 
                 [rid, f'CA-AUTO-{i}', 'Demo User', total, 'completed', dt, dt, '[]'])

# ── 6. TEAM MEMBERS ──────────────────────────────────────────────
team = [
    (rid_veg, 'Amit Kumar', 'Head Chef'),
    (rid_veg, 'Priya Singh', 'Manager'),
    (rid_veg, 'Rahul Verma', 'Line Cook'),
    (rid_veg, 'Sneha Patel', 'Delivery')
]
for rid, name, role in team:
    conn.execute("INSERT INTO team_members (restaurant_id, name, role) VALUES (?,?,?)", [rid, name, role])

conn.commit()
conn.close()
print("✅ Full Environment (including Analytics) restored successfully.")
