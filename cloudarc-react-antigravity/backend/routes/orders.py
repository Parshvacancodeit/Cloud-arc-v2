import json
import random
import string
from flask import Blueprint, request, jsonify, g
from database import query_db, execute_db
from auth_middleware import require_auth

orders_bp = Blueprint('orders', __name__)

STATUSES = ['received', 'preparing', 'ready', 'dispatched', 'completed', 'cancelled']


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
    # SECURITY FIX: IDOR — verify caller owns this restaurant
    if g.restaurant_id != restaurant_id:
        return jsonify({'message': 'Forbidden'}), 403

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
    # SECURITY FIX: IDOR — verify caller owns this restaurant
    if g.restaurant_id != restaurant_id:
        return jsonify({'message': 'Forbidden'}), 403

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
            items, total_amount, notes, assigned_to, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))''',
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
    cust_msg  = data.get('customer_message')

    if status not in STATUSES:
        return jsonify({'message': f'Invalid status. Must be one of {STATUSES}'}), 400

    # SECURITY FIX: Check order exists AND belongs to the caller's restaurant
    # Do this BEFORE performing any update (order-not-found was previously checked after!)
    row = query_db('SELECT id, restaurant_id FROM orders WHERE id=?', [order_id], one=True)
    if not row:
        return jsonify({'message': 'Order not found'}), 404
    if g.restaurant_id != row['restaurant_id']:
        return jsonify({'message': 'Forbidden'}), 403

    if status == 'preparing' and not cust_msg:
        cust_msg = "Order Accepted! We're starting your meal. 👨‍🍳"
    elif status == 'cancelled' and not cust_msg:
        cust_msg = "Unfortunately, we cannot fulfill this order at the moment. It has been cancelled. 😔"

    if status == 'preparing':
        if assigned is not None:
            execute_db(
                "UPDATE orders SET status=?, assigned_to=?, accepted_at=strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), updated_at=strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), customer_message=? WHERE id=?",
                [status, assigned, cust_msg, order_id]
            )
        else:
            execute_db(
                "UPDATE orders SET status=?, accepted_at=strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), updated_at=strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), customer_message=? WHERE id=?",
                [status, cust_msg, order_id]
            )
    elif status == 'ready':
        execute_db(
            "UPDATE orders SET status=?, ready_at=strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), updated_at=strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), customer_message='Order is Ready for pickup! 🎁' WHERE id=?",
            [status, order_id]
        )
    elif status == 'cancelled':
        execute_db(
            "UPDATE orders SET status=?, updated_at=datetime('now'), customer_message=? WHERE id=?",
            [status, cust_msg, order_id]
        )
    else:
        if assigned is not None:
            execute_db(
                "UPDATE orders SET status=?, assigned_to=?, updated_at=datetime('now'), customer_message=? WHERE id=?",
                [status, assigned, cust_msg, order_id]
            )
        else:
            execute_db(
                "UPDATE orders SET status=?, updated_at=datetime('now'), customer_message=? WHERE id=?",
                [status, cust_msg, order_id]
            )

    updated = query_db('SELECT * FROM orders WHERE id=?', [order_id], one=True)
    return jsonify(_row_to_dict(updated))


@orders_bp.route('/api/orders/<int:order_id>', methods=['DELETE'])
@require_auth
def delete_order(order_id):
    # SECURITY FIX: Check existence AND ownership before deleting
    row = query_db('SELECT id, restaurant_id FROM orders WHERE id=?', [order_id], one=True)
    if not row:
        return jsonify({'message': 'Order not found'}), 404
    if g.restaurant_id != row['restaurant_id']:
        return jsonify({'message': 'Forbidden'}), 403

    execute_db('DELETE FROM orders WHERE id=?', [order_id])
    return jsonify({'message': 'Order deleted'})
