from flask import Blueprint, render_template_string, request, jsonify
from database import query_db
from auth_middleware import require_auth
import os

db_viewer_bp = Blueprint('db_viewer', __name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>CloudArc DB Viewer</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f1f5f9; padding: 20px; }
        h1 { color: #00adb5; }
        .table-container { margin-bottom: 40px; overflow-x: auto; background: #1e293b; border-radius: 8px; padding: 15px; border: 1px solid #334155; }
        h2 { border-bottom: 2px solid #00adb5; padding-bottom: 5px; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #334155; padding: 10px; text-align: left; font-size: 14px; }
        th { background: #334155; color: #00adb5; }
        tr:nth-child(even) { background: #1a2235; }
        tr:hover { background: #2d3748; }
        .empty { color: #94a3b8; font-style: italic; }
        .warning { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); padding: 12px 16px; border-radius: 8px; color: #f87171; margin-bottom: 20px; font-weight: 600; }
    </style>
</head>
<body>
    <h1>📦 CloudArc Database Viewer</h1>
    <div class="warning">⚠️ DEBUG ONLY — This endpoint is disabled in production. Do not expose this URL publicly.</div>
    
    {% for table_name, columns, rows in tables %}
    <div class="table-container">
        <h2>Table: {{ table_name }}</h2>
        {% if rows %}
        <table>
            <thead>
                <tr>
                    {% for col in columns %}
                    <th>{{ col }}</th>
                    {% endfor %}
                </tr>
            </thead>
            <tbody>
                {% for row in rows %}
                <tr>
                    {% for col in columns %}
                    <td>{{ row[col] }}</td>
                    {% endfor %}
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}
        <p class="empty">No data in this table.</p>
        {% endif %}
    </div>
    {% endfor %}
</body>
</html>
"""

# ── SECURITY FIX: This endpoint now requires authentication AND only works in DEBUG mode ──
@db_viewer_bp.route('/api/debug/db-viewer')
@require_auth
def view_db():
    # Hard block in production — DEBUG must be explicitly set to 'true' in environment
    if not (os.getenv('DEBUG', 'false').lower() == 'true'):
        return jsonify({'message': 'This endpoint is disabled in production'}), 403

    tables_to_show = ['users', 'restaurants', 'menu_items', 'orders', 'team_members', 'alerts', 'customers']
    data = []
    
    for table in tables_to_show:
        try:
            columns_info = query_db(f"PRAGMA table_info({table})")
            columns = [c['name'] for c in columns_info]
            
            # Mask sensitive columns instead of hiding the table
            rows = query_db(f"SELECT * FROM {table}")
            masked_rows = []
            SENSITIVE_COLS = {'password_hash', 'gst_number', 'fssai_license'}
            for row in rows:
                d = dict(row)
                for col in SENSITIVE_COLS:
                    if col in d:
                        d[col] = '*** REDACTED ***'
                masked_rows.append(d)

            data.append((table, columns, masked_rows))
        except Exception as e:
            print(f"Error reading table {table}: {e}")
            
    return render_template_string(HTML_TEMPLATE, tables=data)
