import json
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import query_db, execute_db
from auth_middleware import generate_token, require_auth
from flask import g

auth_bp = Blueprint('auth', __name__)

DEFAULT_OPERATING_HOURS = {
    "monday":    {"open": "09:00", "close": "22:00", "closed": False},
    "tuesday":   {"open": "09:00", "close": "22:00", "closed": False},
    "wednesday": {"open": "09:00", "close": "22:00", "closed": False},
    "thursday":  {"open": "09:00", "close": "22:00", "closed": False},
    "friday":    {"open": "09:00", "close": "23:00", "closed": False},
    "saturday":  {"open": "09:00", "close": "23:00", "closed": False},
    "sunday":    {"open": "10:00", "close": "22:00", "closed": False},
}


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    name     = (data.get('name') or '').strip()

    # Kitchen / restaurant fields
    kitchen_name   = (data.get('kitchen_name') or name or 'My Kitchen').strip()
    business_type  = data.get('business_type') or 'cloud-kitchen'
    city           = (data.get('city') or '').strip()
    pincode        = (data.get('pincode') or '').strip()
    cuisine_types  = data.get('cuisine_types') or []
    phone          = (data.get('phone') or '').strip()
    opening_time   = data.get('opening_time') or '09:00'
    closing_time   = data.get('closing_time') or '23:00'
    daily_capacity = data.get('daily_order_capacity') or '10-30'
    owner_name     = (data.get('owner_name') or name).strip()

    # Basic validation
    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400
    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400

    # Check duplicate email
    existing = query_db('SELECT id FROM users WHERE email = ?', [email], one=True)
    if existing:
        return jsonify({'message': 'An account with this email already exists'}), 409

    # Create user
    pw_hash = generate_password_hash(password)
    cur = execute_db(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [email, pw_hash, name]
    )
    user_id = cur.lastrowid

    # Create restaurant
    cur2 = execute_db(
        '''INSERT INTO restaurants
           (user_id, name, owner_name, phone, email, city, pincode,
            business_type, cuisine_types, opening_time, closing_time,
            daily_order_capacity, operating_hours)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        [
            user_id, kitchen_name, owner_name, phone, email, city, pincode,
            business_type, json.dumps(cuisine_types), opening_time, closing_time,
            daily_capacity, json.dumps(DEFAULT_OPERATING_HOURS)
        ]
    )
    restaurant_id = cur2.lastrowid

    # Seed a welcome alert
    execute_db(
        '''INSERT INTO alerts (restaurant_id, title, message, type)
           VALUES (?, ?, ?, ?)''',
        [restaurant_id,
         'Welcome to CloudArc! 🎉',
         'Your kitchen is set up. Add your first menu items and start taking orders!',
         'success']
    )

    token = generate_token(user_id, restaurant_id)
    return jsonify({
        'token': token,
        'restaurant_id': restaurant_id,
        'user': {'id': user_id, 'name': name, 'email': email},
        'restaurant': {'id': restaurant_id, 'name': kitchen_name},
    }), 201


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = query_db('SELECT * FROM users WHERE email = ?', [email], one=True)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'message': 'Invalid email or password'}), 401

    restaurant = query_db(
        'SELECT * FROM restaurants WHERE user_id = ? LIMIT 1', [user['id']], one=True
    )
    if not restaurant:
        return jsonify({'message': 'No restaurant found for this account'}), 404

    token = generate_token(user['id'], restaurant['id'])
    return jsonify({
        'token': token,
        'restaurant_id': restaurant['id'],
        'user': {'id': user['id'], 'name': user['name'], 'email': user['email']},
        'restaurant': {'id': restaurant['id'], 'name': restaurant['name']},
    })


@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    # JWT is stateless — client discards token
    return jsonify({'message': 'Logged out successfully'})


@auth_bp.route('/api/auth/change-password', methods=['POST'])
@require_auth
def change_password():
    data = request.get_json(silent=True) or {}
    old_pw = data.get('old_password')
    new_pw = data.get('new_password')

    if not old_pw or not new_pw:
        return jsonify({'message': 'Old and new passwords are required'}), 400

    user = query_db('SELECT * FROM users WHERE id = ?', [g.user_id], one=True)
    if not user or not check_password_hash(user['password_hash'], old_pw):
        return jsonify({'message': 'Incorrect old password'}), 401

    if len(new_pw) < 6:
        return jsonify({'message': 'New password must be at least 6 characters'}), 400

    new_hash = generate_password_hash(new_pw)
    execute_db('UPDATE users SET password_hash = ? WHERE id = ?', [new_hash, g.user_id])
    return jsonify({'message': 'Password updated successfully'})


@auth_bp.route('/api/auth/toggle-2fa', methods=['POST'])
@require_auth
def toggle_2fa():
    data = request.get_json(silent=True) or {}
    enabled = bool(data.get('enabled', False))
    # In a real app, we would generate/verify a TOTP secret here.
    # For this project, we'll toggle a flag.
    execute_db('UPDATE users SET two_factor_enabled = ? WHERE id = ?', [1 if enabled else 0, g.user_id])
    return jsonify({'message': f'2FA {"enabled" if enabled else "disabled"} successfully'})
