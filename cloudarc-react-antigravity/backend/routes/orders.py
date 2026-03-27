import json
import random
import string
from flask import Blueprint, request, jsonify
from database import query_db, execute_db
from auth_middleware import require_auth

orders_bp = Blueprint('orders', __name__)

STATUSES = ['received', 'preparing', 'ready', 'dispatched', 'completed']


def _gen_order_number():
    """Generate a short human-readable order number like CA-X4K2."""
    return 'CA-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))


def _row_to_dict(r):
    d = dict(r)
    d['items'] = json.loads(d.get('items') or '[]')
    return d


@orders_bp.route('/api/orders/<int:restaurant_id>', methods=['GET'])
@require_auth
def get_orders(restaurant_id):
    """Returns orders grouped by status column for the Kanban board."""
    rows = query_db(
        '''SELECT * FROM orders WHERE restaurant_id=? ORDER BY created_at DESC''',
        [restaurant_id]
    )
    board = {s: [] for s in STATUSES}
    for r in rows:
        d = _row_to_dict(r)
        status = d.get('status', 'received')
        if status in board:
            board[status].append(d)
    return jsonify(board)


@orders_bp.route('/api/orders/<int:restaurant_id>', methods=['POST'])
@require_auth
def create_order(restaurant_id):
    data = request.get_json(silent=True) or {}
    order_number    = data.get('order_number') or _gen_order_number()
    platform        = data.get('platform') or 'Direct'
    status          = data.get('status') or 'received'
    priority        = data.get('priority') or 'normal'
    customer_name   = data.get('customer_name') or ''
    customer_phone  = data.get('customer_phone') or ''
    customer_address = data.get('customer_address') or ''
    items           = data.get('items') or []
    total_amount    = float(data.get('total_amount') or data.get('total') or 0)
    notes           = data.get('notes') or ''
    assigned_to     = data.get('assigned_to') or ''

    if status not in STATUSES:
        status = 'received'

    cur = execute_db(
        '''INSERT INTO orders
           (restaurant_id, order_number, platform, status, priority,
            customer_name, customer_phone, customer_address,
            items, total_amount, notes, assigned_to)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
        [restaurant_id, order_number, platform, status, priority,
         customer_name, customer_phone, customer_address,
         json.dumps(items), total_amount, notes, assigned_to]
    )
    row = query_db('SELECT * FROM orders WHERE id=?', [cur.lastrowid], one=True)
    return jsonify(_row_to_dict(row)), 201


@orders_bp.route('/api/orders/<int:order_id>/status', methods=['PATCH'])
@require_auth
def update_status(order_id):
    data      = request.get_json(silent=True) or {}
    status    = data.get('status') or ''
    assigned  = data.get('assigned_to')

    if status not in STATUSES:
        return jsonify({'message': f'Invalid status. Must be one of {STATUSES}'}), 400

    if assigned is not None:
        execute_db(
            "UPDATE orders SET status=?, assigned_to=?, updated_at=datetime('now') WHERE id=?",
            [status, assigned, order_id]
        )
    else:
        execute_db(
            "UPDATE orders SET status=?, updated_at=datetime('now') WHERE id=?",
            [status, order_id]
        )

    row = query_db('SELECT * FROM orders WHERE id=?', [order_id], one=True)
    if not row:
        return jsonify({'message': 'Order not found'}), 404
    return jsonify(_row_to_dict(row))


@orders_bp.route('/api/orders/<int:order_id>', methods=['DELETE'])
@require_auth
def delete_order(order_id):
    row = query_db('SELECT id FROM orders WHERE id=?', [order_id], one=True)
    if not row:
        return jsonify({'message': 'Order not found'}), 404
    execute_db('DELETE FROM orders WHERE id=?', [order_id])
    return jsonify({'message': 'Order deleted'})
