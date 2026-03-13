from flask import Blueprint, jsonify, request
from app.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password') # In prod, verify against password_hash

    # Dummy auth for development
    if username == 'warner' and password == 'owner123':
         return jsonify({
            "token": "mock-token-owner",
            "role": "OWNER",
            "message": "Login successful"
        }), 200
        
    elif username == 'accountant' and password == 'acc123':
        return jsonify({
            "token": "mock-token-accountant",
            "role": "ACCOUNTANT",
            "message": "Login successful"
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401
