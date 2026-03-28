import json
from datetime import date, timedelta, datetime
from flask import Blueprint, request, jsonify
from database import query_db
from auth_middleware import require_auth

analytics_bp = Blueprint('analytics', __name__)

PERIOD_MAP = {
    'today': 0,
    '7d': 7,
    '30d': 30,
    '365d': 365,
}


def _period_start(period_str):
    days = PERIOD_MAP.get(period_str, 7)
    if days == 0:
        return date.today().isoformat() + ' 00:00:00'
    return (date.today() - timedelta(days=days)).isoformat() + ' 00:00:00'


@analytics_bp.route('/api/analytics/<int:restaurant_id>', methods=['GET'])
@require_auth
def get_analytics(restaurant_id):
    period = request.args.get('period', '7d')
    start = _period_start(period)
    now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    # ── Summary ────────────────────────────────────────────────────
    summary_row = query_db(
        '''SELECT
             COUNT(*) as total_orders,
             COALESCE(SUM(total_amount), 0) as total_revenue,
             COALESCE(AVG(total_amount), 0) as avg_order_value
           FROM orders
           WHERE restaurant_id=? AND created_at BETWEEN ? AND ?''',
        [restaurant_id, start, now], one=True
    )
    rest_row = query_db(
        'SELECT avg_prep_time FROM restaurants WHERE id=?', [restaurant_id], one=True
    )
    avg_prep = rest_row['avg_prep_time'] if rest_row else 18

    summary = {
        'total_orders': summary_row['total_orders'] if summary_row else 0,
        'total_revenue': round(summary_row['total_revenue'], 2) if summary_row else 0,
        'avg_order_value': round(summary_row['avg_order_value'], 2) if summary_row else 0,
        'avg_prep_time': avg_prep,
    }

    # ── Revenue Chart (daily buckets) ──────────────────────────────
    revenue_rows = query_db(
        '''SELECT DATE(created_at) as date,
                  COALESCE(SUM(total_amount), 0) as revenue,
                  COUNT(*) as orders
           FROM orders
           WHERE restaurant_id=? AND created_at BETWEEN ? AND ?
           GROUP BY DATE(created_at)
           ORDER BY date ASC''',
        [restaurant_id, start, now]
    )
    revenue_chart = [
        {'date': r['date'], 'revenue': round(r['revenue'], 2), 'orders': r['orders']}
        for r in revenue_rows
    ]

    # ── Orders by Platform ─────────────────────────────────────────
    platform_rows = query_db(
        '''SELECT platform,
                  COUNT(*) as count,
                  COALESCE(SUM(total_amount), 0) as revenue
           FROM orders
           WHERE restaurant_id=? AND created_at BETWEEN ? AND ?
           GROUP BY platform
           ORDER BY count DESC''',
        [restaurant_id, start, now]
    )
    orders_by_platform = [
        {'platform': r['platform'], 'count': r['count'], 'revenue': round(r['revenue'], 2)}
        for r in platform_rows
    ]

    # ── Top Menu Items ─────────────────────────────────────────────
    all_orders = query_db(
        "SELECT items FROM orders WHERE restaurant_id=? AND created_at BETWEEN ? AND ?",
        [restaurant_id, start, now]
    )
    item_agg = {}
    for o in all_orders:
        items = json.loads(o['items'] or '[]')
        for item in items:
            name = item.get('name') or item.get('item_name') or 'Unknown'
            qty  = int(item.get('qty') or item.get('quantity') or 1)
            price = float(item.get('price') or 0)
            if name not in item_agg:
                item_agg[name] = {'orders': 0, 'revenue': 0}
            item_agg[name]['orders'] += qty
            item_agg[name]['revenue'] += qty * price

    top_items = [
        {'name': k, 'orders': v['orders'], 'revenue': round(v['revenue'], 2), 'trend': 'up'}
        for k, v in sorted(item_agg.items(), key=lambda x: -x[1]['orders'])
    ][:10]

    # ── Orders by Hour (fill all 24 hours so chart has no gaps) ───
    hour_rows = query_db(
        '''SELECT strftime('%H:00', created_at) as hour,
                  COUNT(*) as count
           FROM orders
           WHERE restaurant_id=? AND created_at BETWEEN ? AND ?
           GROUP BY hour
           ORDER BY hour ASC''',
        [restaurant_id, start, now]
    )
    hour_map = {f'{h:02d}:00': 0 for h in range(24)}
    for r in hour_rows:
        hour_map[r['hour']] = r['count']
    orders_by_hour = [{'hour': h, 'count': c} for h, c in sorted(hour_map.items())]

    # ── Performance (calculated from real data) ────────────────────
    total = summary['total_orders']

    # Completion rate: completed orders / all orders in period
    completed_row = query_db(
        '''SELECT COUNT(*) as cnt FROM orders
           WHERE restaurant_id=? AND status='completed'
           AND created_at BETWEEN ? AND ?''',
        [restaurant_id, start, now], one=True
    )
    completed_count = completed_row['cnt'] if completed_row else 0

    # Cancelled orders
    cancelled_row = query_db(
        '''SELECT COUNT(*) as cnt FROM orders
           WHERE restaurant_id=? AND status='cancelled'
           AND created_at BETWEEN ? AND ?''',
        [restaurant_id, start, now], one=True
    )
    cancelled_count = cancelled_row['cnt'] if cancelled_row else 0

    # Fulfillment rate = non-cancelled / total
    fulfillment_rate = round(((total - cancelled_count) / max(total, 1)) * 100)
    # Completion rate = completed / total
    completion_rate = round((completed_count / max(total, 1)) * 100)

    # Average items per order
    avg_items_row = query_db(
        '''SELECT items FROM orders
           WHERE restaurant_id=? AND created_at BETWEEN ? AND ?''',
        [restaurant_id, start, now]
    )
    total_items = 0
    for row in avg_items_row:
        items = json.loads(row['items'] or '[]')
        total_items += sum(int(i.get('qty') or i.get('quantity') or 1) for i in items)
    avg_items = round(total_items / max(total, 1), 1)

    # Peak hour
    peak_hour = max(orders_by_hour, key=lambda x: x['count'])['hour'] if orders_by_hour else '12:00'

    performance = {
        'completion_rate': completion_rate,
        'fulfillment_rate': fulfillment_rate,
        'avg_items_per_order': avg_items,
        'peak_hour': peak_hour,
        'total_items_sold': total_items,
        'cancelled_count': cancelled_count,
    }

    return jsonify({
        'summary': summary,
        'revenue_chart': revenue_chart,
        'orders_by_platform': orders_by_platform,
        'top_items': top_items,
        'orders_by_hour': orders_by_hour,
        'performance': performance,
    })
