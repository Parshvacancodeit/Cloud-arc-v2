import sqlite3
import os

base_dir = '/Users/parshvapatel/Desktop/Main-Cloudarc/cloudarc-react-antigravity/backend'
db_path = os.path.join(base_dir, 'cloudarc.db')

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables in database:")
    for table in tables:
        print(f"- {table[0]}")
    conn.close()
