import json
import datetime
import random
import string
from flask import Blueprint, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
from database import query_db, execute_db
from auth_middleware import generate_token, require_auth

customer_auth_bp = Blueprint('customer_auth', __name__)


def _gen_order_number():
    """Generate a unique random order number — avoids minute/second collisions."""
    return 'CA-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def require_customer_auth(f):
    """Middleware: validates JWT and ensures this is a customer token (restaurant_id == 0)."""
    from functools import wraps

    @wraps(f)
    def decorated(*args, **kwargs):
        # require_auth sets g.user_id and g.restaurant_id
        # For customers, restaurant_id is 0 — this distinguishes them from restaurant owners
        if not hasattr(g, 'user_id'):
            return jsonify({'message': 'Customer authentication required'}), 401
        if g.restaurant_id != 0:
            # This token belongs to a restaurant owner, not a customer
            return jsonify({'message': 'Customer token required'}), 403
        return f(*args, **kwargs)

    return require_auth(decorated)


@customer_auth_bp.route('/api/customer/orders', methods=['GET'])
@require_customer_auth
def get_customer_orders():
    """Returns orders placed by the current customer."""
    rows = query_db(
        '''SELECT o.*, r.name as restaurant_name 
           FROM orders o 
           JOIN restaurants r ON o.restaurant_id = r.id
           WHERE o.customer_id=? 
           ORDER BY o.created_at DESC''',
        [g.user_id]
    )
    orders = []
    for r in rows:
        d = dict(r)
        d['items'] = json.loads(d.get('items') or '[]')
        orders.append(d)
    return jsonify(orders)


@customer_auth_bp.route('/api/customer/place-order/<int:restaurant_id>', methods=['POST'])
@require_customer_auth
def customer_place_order(restaurant_id):
    """Customer places an order at a specific restaurant."""
    data = request.get_json(silent=True) or {}

    # Verify target restaurant is active
    rest = query_db('SELECT id, is_active FROM restaurants WHERE id=?', [restaurant_id], one=True)
    if not rest:
        return jsonify({'message': 'Restaurant not found'}), 404
    if not rest['is_active']:
        return jsonify({'message': 'This restaurant is currently closed'}), 400

    # Get customer profile
    cust = query_db('SELECT * FROM customers WHERE id=?', [g.user_id], one=True)
    if not cust:
        return jsonify({'message': 'Customer not found'}), 404

    # BUGFIX: Use random suffix to avoid order number collisions from rapid orders
    order_number     = _gen_order_number()
    platform         = data.get('source_app') or 'CloudArc App'
    status           = 'received'
    priority         = 'normal'
    customer_name    = data.get('customer_name') or cust['name']
    customer_phone   = data.get('customer_phone') or cust['phone'] or 'Not Provided'
    customer_address = data.get('customer_address') or cust['address'] or 'Not Provided'
    items            = data.get('items') or []
    total_amount     = float(data.get('total_amount') or 0)
    notes            = data.get('notes') or ''

    if not items:
        return jsonify({'message': 'Order must contain at least one item'}), 400

    cur = execute_db(
        '''INSERT INTO orders
           (restaurant_id, order_number, platform, status, priority,
            customer_name, customer_phone, customer_address,
            items, total_amount, notes, customer_id)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
        [restaurant_id, order_number, platform, status, priority,
         customer_name, customer_phone, customer_address,
         json.dumps(items), total_amount, notes, g.user_id]
    )

    # Seed an alert for the restaurant
    execute_db(
        '''INSERT INTO alerts (restaurant_id, title, message, type)
           VALUES (?, ?, ?, ?)''',
        [restaurant_id, 'New Order Received! 🍕',
         f'Order {order_number} just came in from {customer_name}.', 'info']
    )

    return jsonify({'id': cur.lastrowid, 'order_number': order_number}), 201


@customer_auth_bp.route('/api/customer/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email   = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    name    = (data.get('name') or '').strip()
    phone   = (data.get('phone') or '').strip()
    address = (data.get('address') or '').strip()
    pincode = (data.get('pincode') or '').strip()

    if not email or not password or not name:
        return jsonify({'message': 'Email, password and name are required'}), 400

    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400

    existing = query_db('SELECT id FROM customers WHERE email = ?', [email], one=True)
    if existing:
        return jsonify({'message': 'Account with this email already exists'}), 409

    pw_hash = generate_password_hash(password)
    cur = execute_db(
        'INSERT INTO customers (email, password_hash, name, phone, address, pincode) VALUES (?, ?, ?, ?, ?, ?)',
        [email, pw_hash, name, phone, address, pincode]
    )
    customer_id = cur.lastrowid

    # Customer tokens use restaurant_id=0 to distinguish from restaurant owner tokens
    token = generate_token(customer_id, 0)

    return jsonify({
        'token': token,
        'customer': {'id': customer_id, 'name': name, 'email': email, 'phone': phone, 'address': address}
    }), 201


@customer_auth_bp.route('/api/customer/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    customer = query_db('SELECT * FROM customers WHERE email = ?', [email], one=True)
    if not customer or not check_password_hash(customer['password_hash'], password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = generate_token(customer['id'], 0)
    return jsonify({
        'token': token,
        'customer': {
            'id': customer['id'],
            'name': customer['name'],
            'email': customer['email'],
            'phone': customer['phone'],
            'address': customer['address'],
        }
    })


@customer_auth_bp.route('/api/customer/me', methods=['GET'])
@require_customer_auth
def get_me():
    """Returns the current customer's profile."""
    cust = query_db('SELECT id, name, email, phone, address, pincode FROM customers WHERE id=?', [g.user_id], one=True)
    if not cust:
        return jsonify({'message': 'Customer not found'}), 404
    return jsonify(dict(cust))
