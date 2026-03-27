import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), 'cloudarc.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    print(f"Migrating {db_path}...")
    
    # Add customer_id to orders if it doesn't exist
    try:
        cur.execute('ALTER TABLE orders ADD COLUMN customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;')
        print("Added customer_id column to orders table.")
    except sqlite3.OperationalError as e:
        if 'duplicate column name' in str(e).lower():
            print("customer_id column already exists.")
        else:
            print(f"Error adding column: {e}")
            
    # Create customers table
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    with open(schema_path, 'r') as f:
        # We can just run the whole script again since it uses IF NOT EXISTS
        cur.executescript(f.read())
        print("Executed schema script.")
    
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == '__main__':
    migrate()
