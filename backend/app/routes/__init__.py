from flask import Blueprint

api_bp = Blueprint('api', __name__)

from .auth import auth_bp
from .mine import mine_bp
from .factory import factory_bp
from .dashboard import dashboard_bp
from .lorry import lorry_bp
from .reports import reports_bp
from .expense import expense_bp

api_bp.register_blueprint(auth_bp, url_prefix='/auth')
api_bp.register_blueprint(mine_bp, url_prefix='/mine')
api_bp.register_blueprint(factory_bp, url_prefix='/factory')
api_bp.register_blueprint(dashboard_bp, url_prefix='/dashboard')
api_bp.register_blueprint(lorry_bp, url_prefix='/lorry')
api_bp.register_blueprint(reports_bp, url_prefix='/reports')
api_bp.register_blueprint(expense_bp, url_prefix='/expense')
