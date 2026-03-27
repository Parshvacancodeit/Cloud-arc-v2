import json
from flask import Blueprint, request, jsonify
from database import query_db

public_bp = Blueprint('public', __name__)


def _restaurant_to_dict(r):
    d = dict(r)
    d['cuisine_types'] = json.loads(d.get('cuisine_types') or '[]')
    d['operating_hours'] = json.loads(d.get('operating_hours') or '{}')
    for field in ['zomato_connected', 'swiggy_connected', 'uber_eats_connected', 'is_active']:
        d.pop(field, None)
    # Remove sensitive fields
    for field in ['user_id', 'gst_number', 'fssai_license',
                  'order_notifications', 'email_notifications',
                  'sms_notifications', 'low_stock_alerts', 'peak_hour_reminders']:
        d.pop(field, None)
    return d


@public_bp.route('/api/public/restaurants', methods=['GET'])
def get_restaurants_by_pincode():
    """Public endpoint: find restaurants by pincode (customer app)."""
    pincode = request.args.get('pincode', '').strip()
    if not pincode:
        return jsonify({'message': 'pincode query param required'}), 400

    rows = query_db(
        '''SELECT * FROM restaurants WHERE pincode=? AND is_active=1
           ORDER BY name ASC''',
        [pincode]
    )
    return jsonify([_restaurant_to_dict(r) for r in rows])


@public_bp.route('/api/public/restaurants/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    """Public endpoint: single restaurant info."""
    row = query_db(
        'SELECT * FROM restaurants WHERE id=? AND is_active=1', [restaurant_id], one=True
    )
    if not row:
        return jsonify({'message': 'Restaurant not found'}), 404
    return jsonify(_restaurant_to_dict(row))


@public_bp.route('/api/public/restaurants/<int:restaurant_id>/menu', methods=['GET'])
def get_public_menu(restaurant_id):
    """Public endpoint: available menu items for customer ordering."""
    rows = query_db(
        '''SELECT id, name, category, price, description, prep_time,
                  is_veg, is_bestseller, platforms, image_url
           FROM menu_items
           WHERE restaurant_id=? AND is_available=1
           ORDER BY category, name''',
        [restaurant_id]
    )
    items = []
    for r in rows:
        d = dict(r)
        d['platforms'] = json.loads(d.get('platforms') or '[]')
        d['is_veg'] = bool(d.get('is_veg', 1))
        d['is_bestseller'] = bool(d.get('is_bestseller', 0))
        items.append(d)
    return jsonify(items)
