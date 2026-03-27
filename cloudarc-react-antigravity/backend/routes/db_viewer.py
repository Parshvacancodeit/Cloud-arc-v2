from flask import Blueprint, render_template_string
from database import query_db

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
    </style>
</head>
<body>
    <h1>📦 CloudArc Database Viewer</h1>
    
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

@db_viewer_bp.route('/api/debug/db-viewer')
def view_db():
    # Only allow for debugging/demo
    tables_to_show = ['users', 'restaurants', 'menu_items', 'orders', 'team_members', 'alerts', 'customers']
    data = []
    
    for table in tables_to_show:
        try:
            # Get columns
            columns_info = query_db(f"PRAGMA table_info({table})")
            columns = [c['name'] for c in columns_info]
            
            # Get rows
            rows = query_db(f"SELECT * FROM {table}")
            data.append((table, columns, rows))
        except Exception as e:
            print(f"Error reading table {table}: {e}")
            
    return render_template_string(HTML_TEMPLATE, tables=data)
