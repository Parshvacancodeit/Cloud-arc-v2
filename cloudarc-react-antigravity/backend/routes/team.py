import json
from flask import Blueprint, request, jsonify
from database import query_db, execute_db
from auth_middleware import require_auth

team_bp = Blueprint('team', __name__)


def _row_to_dict(r):
    d = dict(r)
    d['permissions'] = json.loads(d.get('permissions') or '[]')
    return d


@team_bp.route('/api/team/<int:restaurant_id>', methods=['GET'])
@require_auth
def get_team(restaurant_id):
    rows = query_db(
        'SELECT * FROM team_members WHERE restaurant_id=? ORDER BY name',
        [restaurant_id]
    )
    return jsonify([_row_to_dict(r) for r in rows])


@team_bp.route('/api/team/<int:restaurant_id>', methods=['POST'])
@require_auth
def create_member(restaurant_id):
    data = request.get_json(silent=True) or {}
    name        = (data.get('name') or '').strip()
    role        = data.get('role') or ''
    email       = (data.get('email') or '').strip().lower()
    phone       = data.get('phone') or ''
    station     = data.get('station') or ''
    shift       = data.get('shift') or 'Morning'
    permissions = data.get('permissions') or []

    if not name:
        return jsonify({'message': 'Name is required'}), 400

    cur = execute_db(
        '''INSERT INTO team_members
           (restaurant_id, name, role, email, phone, station, shift, permissions)
           VALUES (?,?,?,?,?,?,?,?)''',
        [restaurant_id, name, role, email, phone, station, shift, json.dumps(permissions)]
    )
    row = query_db('SELECT * FROM team_members WHERE id=?', [cur.lastrowid], one=True)
    return jsonify(_row_to_dict(row)), 201


@team_bp.route('/api/team/member/<int:member_id>', methods=['PUT'])
@require_auth
def update_member(member_id):
    data = request.get_json(silent=True) or {}
    row = query_db('SELECT * FROM team_members WHERE id=?', [member_id], one=True)
    if not row:
        return jsonify({'message': 'Team member not found'}), 404

    name        = data.get('name', row['name'])
    role        = data.get('role', row['role'])
    email       = data.get('email', row['email'])
    phone       = data.get('phone', row['phone'])
    station     = data.get('station', row['station'])
    shift       = data.get('shift', row['shift'])
    permissions = data.get('permissions', json.loads(row['permissions'] or '[]'))
    status      = data.get('status', row['status'])

    execute_db(
        '''UPDATE team_members SET name=?, role=?, email=?, phone=?,
           station=?, shift=?, permissions=?, status=? WHERE id=?''',
        [name, role, email, phone, station, shift, json.dumps(permissions), status, member_id]
    )
    updated = query_db('SELECT * FROM team_members WHERE id=?', [member_id], one=True)
    return jsonify(_row_to_dict(updated))


@team_bp.route('/api/team/member/<int:member_id>', methods=['DELETE'])
@require_auth
def delete_member(member_id):
    row = query_db('SELECT id FROM team_members WHERE id=?', [member_id], one=True)
    if not row:
        return jsonify({'message': 'Team member not found'}), 404
    execute_db('DELETE FROM team_members WHERE id=?', [member_id])
    return jsonify({'message': 'Team member removed'})
