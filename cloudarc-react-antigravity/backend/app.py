from flask import Flask
from flask_cors import CORS
from config import Config
from database import close_db, init_db

# ── Import route blueprints ─────────────────────────────────────────────────
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.orders import orders_bp
from routes.menu import menu_bp
from routes.team import team_bp
from routes.analytics import analytics_bp
from routes.settings import settings_bp
from routes.public import public_bp
from routes.customer_auth import customer_auth_bp
from routes.db_viewer import db_viewer_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Allow requests from both Vite dev server and any origin in production
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    })

    # ── Register Blueprints ───────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(team_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(customer_auth_bp)
    app.register_blueprint(db_viewer_bp)

    # ── DB lifecycle ──────────────────────────────────────────────────────────
    app.teardown_appcontext(close_db)

    # ── Global error handlers ──────────────────────────────────────────────────
    from flask import jsonify

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'message': str(e.description)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'message': 'Unauthorized'}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'message': 'Forbidden'}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'message': 'Internal server error'}), 500

    # ── Health check ───────────────────────────────────────────────────────────
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'service': 'CloudArc API', 'version': '1.0.0'})

    # ── Initialize DB on first run ─────────────────────────────────────────────
    with app.app_context():
        init_db()

    return app


if __name__ == '__main__':
    app = create_app()
    print("\n🚀 CloudArc API running at http://localhost:5001")
    print("   Health: http://localhost:5001/api/health\n")
    app.run(host='0.0.0.0', port=5001, debug=Config.DEBUG)
