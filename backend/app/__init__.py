import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
from .models import db, User, MinePurchase, FactoryLoading, FactorySale, Lorry, TripRecord, FuelRecord, DriverExpense, LorryEmi, MaintenanceRecord, PrivateTransport
from .routes import api_bp

def create_app(test_config=None):
    """
    Factory function to create and configure the Flask application.
    """
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))
    app = Flask(__name__, static_folder=frontend_dist)

    # Configure Flask to work properly behind reverse proxies like ngrok
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    # Enable CORS so the React frontend can talk to this backend

    CORS(app)

    # Basic configuration setup
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_dev_key')
    
    # Configure SQLite Database
    base_dir = os.path.abspath(os.path.dirname(__file__))
    if test_config is None:
        app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(base_dir, '..', 'gvk_transport_v2.db')}"
    else:
        app.config.update(test_config)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize the database with this app
    db.init_app(app)

    # Create all tables if they don't exist yet
    with app.app_context():
        db.create_all()

    # Register all our API routes (URLs) under the /api/v1 prefix
    app.register_blueprint(api_bp, url_prefix='/api/v1')

    # A simple health check to ensure the server is running
    @app.route('/api/v1/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "GVK Transport API V2"}), 200

    # Catch-all route to serve React Router
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app
