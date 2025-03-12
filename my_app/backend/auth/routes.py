from flask import Blueprint, request, jsonify, session
from flask_cors import cross_origin  # Import cross_origin decorator
from .cvat_auth import authenticate_with_cvat

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint to authenticate with CVAT using username and password.
    """
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        token_data = authenticate_with_cvat(username, password)
        session['cvat_token'] = token_data['key']
        return jsonify({'message': 'Login successful', 'token': token_data['key']})
    except Exception as e:
        return jsonify({'error': 'Invalid credentials. Please try again.'}), 401

@auth_bp.route('/user', methods=['GET'])
def get_user():
    """
    Endpoint to check if the user is authenticated.
    """
    token = session.get('cvat_token')
    if not token:
        return jsonify({'authenticated': False}), 401
    
    return jsonify({'authenticated': True})
