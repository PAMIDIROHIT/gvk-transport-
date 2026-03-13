import os
from flask import Flask, jsonify
from flask_cors import CORS
from .models import db, User, MinePurchase, FactoryLoading, FactorySale, Lorry, TripRecord, FuelRecord, DriverExpense, LorryEmi, MaintenanceRecord, PrivateTransport
from .routes import api_bp

def create_app():
    """
    Factory function to create and configure the Flask application.
    """
    app = Flask(__name__)

    # Enable CORS so the React frontend can talk to this backend
    CORS(app)

    # Basic configuration setup
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_dev_key')
    
    # Configure SQLite Database
    base_dir = os.path.abspath(os.path.dirname(__name__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(base_dir, '..', 'gvk_transport_v2.db')}"
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

    return app
