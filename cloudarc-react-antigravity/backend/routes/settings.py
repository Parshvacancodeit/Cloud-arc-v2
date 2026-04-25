import json
from flask import Blueprint, request, jsonify, g
from database import query_db, execute_db
from auth_middleware import require_auth

settings_bp = Blueprint('settings', __name__)

DEFAULT_HOURS = {
    "monday":    {"open": "09:00", "close": "22:00", "closed": False},
    "tuesday":   {"open": "09:00", "close": "22:00", "closed": False},
    "wednesday": {"open": "09:00", "close": "22:00", "closed": False},
    "thursday":  {"open": "09:00", "close": "22:00", "closed": False},
    "friday":    {"open": "09:00", "close": "23:00", "closed": False},
    "saturday":  {"open": "09:00", "close": "23:00", "closed": False},
    "sunday":    {"open": "10:00", "close": "22:00", "closed": False},
}


def _row_to_dict(r):
    d = dict(r)
    d['cuisine_types'] = json.loads(d.get('cuisine_types') or '[]')
    d['operating_hours'] = json.loads(d.get('operating_hours') or '{}') or DEFAULT_HOURS
    # Booleans
    for field in ['order_notifications', 'email_notifications', 'sms_notifications',
                  'low_stock_alerts', 'peak_hour_reminders',
                  'zomato_connected', 'swiggy_connected', 'uber_eats_connected', 'is_active']:
        d[field] = bool(d.get(field, 0))
    return d


@settings_bp.route('/api/settings/<int:restaurant_id>', methods=['GET'])
@require_auth
def get_settings(restaurant_id):
    # SECURITY FIX: IDOR — verify caller owns this restaurant
    if g.restaurant_id != restaurant_id:
        return jsonify({'message': 'Forbidden'}), 403

    row = query_db('SELECT * FROM restaurants WHERE id=?', [restaurant_id], one=True)
    if not row:
        return jsonify({'message': 'Restaurant not found'}), 404
    return jsonify(_row_to_dict(row))


@settings_bp.route('/api/settings/<int:restaurant_id>', methods=['PUT'])
@require_auth
def update_settings(restaurant_id):
    # SECURITY FIX: IDOR — verify caller owns this restaurant
    if g.restaurant_id != restaurant_id:
        return jsonify({'message': 'Forbidden'}), 403

    row = query_db('SELECT id FROM restaurants WHERE id=?', [restaurant_id], one=True)
    if not row:
        return jsonify({'message': 'Restaurant not found'}), 404

    data = request.get_json(silent=True) or {}

    def _b(val, default=False):
        return 1 if (val if val is not None else default) else 0

    execute_db(
        '''UPDATE restaurants SET
             name=COALESCE(?, name),
             owner_name=COALESCE(?, owner_name),
             email=COALESCE(?, email),
             phone=COALESCE(?, phone),
             address=COALESCE(?, address),
             city=COALESCE(?, city),
             state=COALESCE(?, state),
             pincode=COALESCE(?, pincode),
             cuisine_types=COALESCE(?, cuisine_types),
             gst_number=COALESCE(?, gst_number),
             fssai_license=COALESCE(?, fssai_license),
             avg_prep_time=COALESCE(?, avg_prep_time),
             min_order_value=COALESCE(?, min_order_value),
             delivery_radius=COALESCE(?, delivery_radius),
             order_notifications=COALESCE(?, order_notifications),
             email_notifications=COALESCE(?, email_notifications),
             sms_notifications=COALESCE(?, sms_notifications),
             low_stock_alerts=COALESCE(?, low_stock_alerts),
             peak_hour_reminders=COALESCE(?, peak_hour_reminders),
             operating_hours=COALESCE(?, operating_hours),
             zomato_connected=COALESCE(?, zomato_connected),
             swiggy_connected=COALESCE(?, swiggy_connected),
             uber_eats_connected=COALESCE(?, uber_eats_connected),
             updated_at=datetime('now')
           WHERE id=?''',
        [
            data.get('name'),
            data.get('owner_name'),
            data.get('email'),
            data.get('phone'),
            data.get('address'),
            data.get('city'),
            data.get('state'),
            data.get('pincode'),
            json.dumps(data['cuisine_types']) if 'cuisine_types' in data else None,
            data.get('gst_number'),
            data.get('fssai_license'),
            data.get('avg_prep_time'),
            data.get('min_order_value'),
            data.get('delivery_radius'),
            _b(data.get('order_notifications')) if 'order_notifications' in data else None,
            _b(data.get('email_notifications')) if 'email_notifications' in data else None,
            _b(data.get('sms_notifications')) if 'sms_notifications' in data else None,
            _b(data.get('low_stock_alerts')) if 'low_stock_alerts' in data else None,
            _b(data.get('peak_hour_reminders')) if 'peak_hour_reminders' in data else None,
            json.dumps(data['operating_hours']) if 'operating_hours' in data else None,
            # BUGFIX: Integration connection flags now included so "Connect" button persists
            _b(data.get('zomato_connected')) if 'zomato_connected' in data else None,
            _b(data.get('swiggy_connected')) if 'swiggy_connected' in data else None,
            _b(data.get('uber_eats_connected')) if 'uber_eats_connected' in data else None,
            restaurant_id,
        ]
    )
    updated = query_db('SELECT * FROM restaurants WHERE id=?', [restaurant_id], one=True)
    return jsonify(_row_to_dict(updated))


@settings_bp.route('/api/settings/<int:restaurant_id>/status', methods=['PATCH'])
@require_auth
def toggle_status(restaurant_id):
    # SECURITY FIX: IDOR — verify caller owns this restaurant
    if g.restaurant_id != restaurant_id:
        return jsonify({'message': 'Forbidden'}), 403

    row = query_db('SELECT id, is_active FROM restaurants WHERE id=?', [restaurant_id], one=True)
    if not row:
        return jsonify({'message': 'Restaurant not found'}), 404

    data = request.get_json(silent=True) or {}
    new_status = 1 if data.get('is_active', not bool(row['is_active'])) else 0

    execute_db(
        "UPDATE restaurants SET is_active=?, updated_at=datetime('now') WHERE id=?",
        [new_status, restaurant_id]
    )

    updated = query_db('SELECT * FROM restaurants WHERE id=?', [restaurant_id], one=True)
    return jsonify(_row_to_dict(updated))


@settings_bp.route('/api/settings/<int:restaurant_id>/integration', methods=['PATCH'])
@require_auth
def toggle_integration(restaurant_id):
    """Dedicated endpoint to connect/disconnect delivery platform integrations."""
    # SECURITY FIX: IDOR check
    if g.restaurant_id != restaurant_id:
        return jsonify({'message': 'Forbidden'}), 403

    row = query_db('SELECT id FROM restaurants WHERE id=?', [restaurant_id], one=True)
    if not row:
        return jsonify({'message': 'Restaurant not found'}), 404

    data = request.get_json(silent=True) or {}
    platform = data.get('platform', '').lower()
    connected = bool(data.get('connected', False))

    VALID_PLATFORMS = {
        'zomato': 'zomato_connected',
        'swiggy': 'swiggy_connected',
        'uber_eats': 'uber_eats_connected',
    }

    if platform not in VALID_PLATFORMS:
        return jsonify({'message': f'Invalid platform. Must be one of: {list(VALID_PLATFORMS.keys())}'}), 400

    col = VALID_PLATFORMS[platform]
    execute_db(
        f"UPDATE restaurants SET {col}=?, updated_at=datetime('now') WHERE id=?",
        [1 if connected else 0, restaurant_id]
    )

    updated = query_db('SELECT * FROM restaurants WHERE id=?', [restaurant_id], one=True)
    return jsonify(_row_to_dict(updated))
