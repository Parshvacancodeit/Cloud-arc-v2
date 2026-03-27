import json
from datetime import date, datetime, timedelta
from flask import Blueprint, request, jsonify
from database import query_db
from auth_middleware import require_auth

dashboard_bp = Blueprint('dashboard', __name__)


def _today_range():
    t = date.today().isoformat()
    return f"{t} 00:00:00", f"{t} 23:59:59"


@dashboard_bp.route('/api/dashboard/stats/<int:restaurant_id>', methods=['GET'])
@require_auth
def get_stats(restaurant_id):
    today_start, today_end = _today_range()
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    yest_start = f"{yesterday} 00:00:00"
    yest_end   = f"{yesterday} 23:59:59"

    # Today's orders
    today_orders_row = query_db(
        "SELECT COUNT(*) as cnt FROM orders WHERE restaurant_id=? AND created_at BETWEEN ? AND ?",
        [restaurant_id, today_start, today_end], one=True
    )
    today_orders = today_orders_row['cnt'] if today_orders_row else 0

    # Yesterday's orders (for trend)
    yest_orders_row = query_db(
        "SELECT COUNT(*) as cnt FROM orders WHERE restaurant_id=? AND created_at BETWEEN ? AND ?",
        [restaurant_id, yest_start, yest_end], one=True
    )
    yest_orders = yest_orders_row['cnt'] if yest_orders_row else 0
    trend_pct = 0
    if yest_orders > 0:
        trend_pct = round(((today_orders - yest_orders) / yest_orders) * 100)

    # Active orders (not dispatched)
    active_row = query_db(
        "SELECT COUNT(*) as cnt FROM orders WHERE restaurant_id=? AND status != 'dispatched'",
        [restaurant_id], one=True
    )
    active_orders = active_row['cnt'] if active_row else 0

    # Today's revenue
    rev_row = query_db(
        "SELECT COALESCE(SUM(total_amount),0) as rev FROM orders WHERE restaurant_id=? AND created_at BETWEEN ? AND ?",
        [restaurant_id, today_start, today_end], one=True
    )
    today_revenue = round(rev_row['rev'], 2) if rev_row else 0

    # Avg revenue trend vs 7-day avg
    week_start = (date.today() - timedelta(days=7)).isoformat() + " 00:00:00"
    week_rev_row = query_db(
        "SELECT COALESCE(SUM(total_amount),0)/7.0 as avg_rev FROM orders WHERE restaurant_id=? AND created_at BETWEEN ? AND ?",
        [restaurant_id, week_start, today_end], one=True
    )
    avg_rev = week_rev_row['avg_rev'] if week_rev_row else 1
    rev_trend = round(((today_revenue - avg_rev) / max(avg_rev, 1)) * 100) if avg_rev else 0

    # Menu item count
    menu_row = query_db(
        "SELECT COUNT(*) as cnt FROM menu_items WHERE restaurant_id=?", [restaurant_id], one=True
    )
    menu_count = menu_row['cnt'] if menu_row else 0

    # Team member count
    team_row = query_db(
        "SELECT COUNT(*) as cnt FROM team_members WHERE restaurant_id=?", [restaurant_id], one=True
    )
    team_count = team_row['cnt'] if team_row else 0

    # Avg prep time (simple estimate from restaurant settings)
    rest_row = query_db("SELECT avg_prep_time FROM restaurants WHERE id=?", [restaurant_id], one=True)
    avg_prep = rest_row['avg_prep_time'] if rest_row else 18

    return jsonify({
        'today_orders': today_orders,
        'order_trend_percent': trend_pct,
        'active_orders': active_orders,
        'today_revenue': today_revenue,
        'revenue_trend_percent': rev_trend,
        'avg_prep_time': avg_prep,
        'prep_time_change': 0,
        'menu_items_count': menu_count,
        'team_members_count': team_count,
    })


@dashboard_bp.route('/api/dashboard/recent-orders/<int:restaurant_id>', methods=['GET'])
@require_auth
def get_recent_orders(restaurant_id):
    limit = min(int(request.args.get('limit', 5)), 20)
    rows = query_db(
        '''SELECT id, order_number, platform, status, total_amount, created_at,
                  customer_name, items
           FROM orders WHERE restaurant_id=? ORDER BY created_at DESC LIMIT ?''',
        [restaurant_id, limit]
    )
    orders = []
    for r in rows:
        items = json.loads(r['items']) if r['items'] else []
        orders.append({
            'id': r['id'],
            'order_number': r['order_number'],
            'platform': r['platform'],
            'status': r['status'],
            'total_amount': r['total_amount'],
            'created_at': r['created_at'],
            'customer_name': r['customer_name'],
            'items_count': len(items),
        })
    return jsonify(orders)


@dashboard_bp.route('/api/dashboard/alerts/<int:restaurant_id>', methods=['GET'])
@require_auth
def get_alerts(restaurant_id):
    rows = query_db(
        '''SELECT id, title, message, type, created_at
           FROM alerts WHERE restaurant_id=? AND is_read=0
           ORDER BY created_at DESC LIMIT 10''',
        [restaurant_id]
    )
    return jsonify([dict(r) for r in rows])
