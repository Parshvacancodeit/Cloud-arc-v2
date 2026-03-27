import sqlite3
import os
from flask import g, current_app
from config import Config

def get_db():
    """Get a database connection for the current application context."""
    if 'db' not in g:
        # Use absolute path to ensure we find the DB even if run from a different CWD
        base_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(base_dir, Config.DATABASE)
        g.db = sqlite3.connect(
            db_path,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
        g.db.execute("PRAGMA journal_mode = WAL")
    return g.db

def close_db(e=None):
    """Close the database connection at end of request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Initialize the database with the schema."""
    db = get_db()
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    with open(schema_path, 'r') as f:
        db.executescript(f.read())
    db.commit()
    print("[DB] Database initialized successfully.")

def query_db(query, args=(), one=False):
    """Helper to execute SELECT queries."""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    """Helper to execute INSERT/UPDATE/DELETE queries."""
    db = get_db()
    cur = db.execute(query, args)
    db.commit()
    return cur
