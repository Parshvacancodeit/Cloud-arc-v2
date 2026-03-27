import jwt
import functools
from flask import request, jsonify, g
from config import Config
from database import query_db


def require_auth(f):
    """
    Decorator that validates JWT Bearer token.
    On success injects g.user_id and g.restaurant_id.
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Authorization token required'}), 401

        token = auth_header.split(' ', 1)[1].strip()
        if not token:
            return jsonify({'message': 'Authorization token required'}), 401

        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired — please log in again'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        g.user_id = payload.get('user_id')
        g.restaurant_id = payload.get('restaurant_id')

        if not g.user_id:
            return jsonify({'message': 'Invalid token payload'}), 401

        return f(*args, **kwargs)
    return decorated


def generate_token(user_id, restaurant_id):
    """Generate a JWT token for the given user and restaurant."""
    import datetime
    payload = {
        'user_id': user_id,
        'restaurant_id': restaurant_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=Config.JWT_EXPIRY_HOURS),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
