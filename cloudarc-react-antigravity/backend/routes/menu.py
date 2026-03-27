import json
from flask import Blueprint, request, jsonify
from database import query_db, execute_db
from auth_middleware import require_auth

menu_bp = Blueprint('menu', __name__)


def _row_to_dict(r):
    d = dict(r)
    d['platforms'] = json.loads(d.get('platforms') or '[]')
    d['is_available'] = bool(d.get('is_available', 1))
    d['is_veg'] = bool(d.get('is_veg', 1))
    d['is_bestseller'] = bool(d.get('is_bestseller', 0))
    return d


@menu_bp.route('/api/menu/<int:restaurant_id>', methods=['GET'])
@require_auth
def get_menu(restaurant_id):
    rows = query_db(
        'SELECT * FROM menu_items WHERE restaurant_id=? ORDER BY category, name',
        [restaurant_id]
    )
    return jsonify([_row_to_dict(r) for r in rows])


@menu_bp.route('/api/menu/<int:restaurant_id>', methods=['POST'])
@require_auth
def create_item(restaurant_id):
    data = request.get_json(silent=True) or {}
    name          = (data.get('name') or '').strip()
    category      = (data.get('category') or '').strip()
    price         = float(data.get('price') or 0)
    description   = (data.get('description') or '').strip()
    prep_time     = int(data.get('prep_time') or 15)
    is_available  = bool(data.get('is_available', True))
    is_veg        = bool(data.get('is_veg', True))
    is_bestseller = bool(data.get('is_bestseller', False))
    platforms     = data.get('platforms') or []
    image_url     = data.get('image_url') or ''

    if not name:
        return jsonify({'message': 'Item name is required'}), 400

    cur = execute_db(
        '''INSERT INTO menu_items
           (restaurant_id, name, category, price, description, prep_time,
            is_available, is_veg, is_bestseller, platforms, image_url)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
        [restaurant_id, name, category, price, description, prep_time,
         1 if is_available else 0, 1 if is_veg else 0,
         1 if is_bestseller else 0, json.dumps(platforms), image_url]
    )
    row = query_db('SELECT * FROM menu_items WHERE id=?', [cur.lastrowid], one=True)
    return jsonify(_row_to_dict(row)), 201


@menu_bp.route('/api/menu/item/<int:item_id>', methods=['PUT'])
@require_auth
def update_item(item_id):
    data = request.get_json(silent=True) or {}
    row = query_db('SELECT * FROM menu_items WHERE id=?', [item_id], one=True)
    if not row:
        return jsonify({'message': 'Menu item not found'}), 404

    name          = data.get('name', row['name'])
    category      = data.get('category', row['category'])
    price         = float(data.get('price', row['price']))
    description   = data.get('description', row['description'])
    prep_time     = int(data.get('prep_time', row['prep_time']))
    is_available  = data.get('is_available', bool(row['is_available']))
    is_veg        = data.get('is_veg', bool(row['is_veg']))
    is_bestseller = data.get('is_bestseller', bool(row['is_bestseller']))
    platforms     = data.get('platforms', json.loads(row['platforms'] or '[]'))
    image_url     = data.get('image_url', row['image_url'])

    execute_db(
        '''UPDATE menu_items SET name=?, category=?, price=?, description=?,
           prep_time=?, is_available=?, is_veg=?, is_bestseller=?,
           platforms=?, image_url=?, updated_at=datetime('now') WHERE id=?''',
        [name, category, price, description, prep_time,
         1 if is_available else 0, 1 if is_veg else 0,
         1 if is_bestseller else 0, json.dumps(platforms), image_url, item_id]
    )
    updated = query_db('SELECT * FROM menu_items WHERE id=?', [item_id], one=True)
    return jsonify(_row_to_dict(updated))


@menu_bp.route('/api/menu/item/<int:item_id>/availability', methods=['PATCH'])
@require_auth
def toggle_availability(item_id):
    data = request.get_json(silent=True) or {}
    is_available = data.get('is_available')
    if is_available is None:
        return jsonify({'message': 'is_available field required'}), 400

    execute_db(
        "UPDATE menu_items SET is_available=?, updated_at=datetime('now') WHERE id=?",
        [1 if is_available else 0, item_id]
    )
    row = query_db('SELECT * FROM menu_items WHERE id=?', [item_id], one=True)
    if not row:
        return jsonify({'message': 'Item not found'}), 404
    return jsonify(_row_to_dict(row))


@menu_bp.route('/api/menu/item/<int:item_id>', methods=['DELETE'])
@require_auth
def delete_item(item_id):
    row = query_db('SELECT id FROM menu_items WHERE id=?', [item_id], one=True)
    if not row:
        return jsonify({'message': 'Menu item not found'}), 404
    execute_db('DELETE FROM menu_items WHERE id=?', [item_id])
    return jsonify({'message': 'Item deleted'})
