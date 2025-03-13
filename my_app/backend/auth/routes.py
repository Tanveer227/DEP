# backend/auth/routes.py
from flask import Blueprint, request, jsonify, session
from .cvat_auth import authenticate_with_cvat
from .database import users_table, get_engine
from sqlalchemy.sql import select
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint to authenticate with CVAT using username and password.
    """
    print("Received login request")  # Debug log
    data = request.json
    print(f"Request data: {data}")  # Debug log

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        # Authenticate with CVAT
        token_data = authenticate_with_cvat(username, password)
        print(f"CVAT response: {token_data}")  # Debug log
        token = token_data.get('key')  # Assuming the token is under 'key'

        # Check if user exists in local database; if not, add them
        engine = get_engine()
        with engine.connect() as conn:
            # Query for existing user
            query = select(users_table).where(users_table.c.username == username)
            result = conn.execute(query)
            existing_user = result.fetchone()

            if not existing_user:
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                insert_query = users_table.insert().values(username=username, password=hashed_password)
                conn.execute(insert_query)
                conn.commit()

        # Store token in session
        session['cvat_token'] = token
        return jsonify({'token': token}), 200
    except Exception as e:
        print(f"Error in login: {e}")  # Debug log
        return jsonify({'error': str(e)}), 500  # Return the actual error for debugging

@auth_bp.route('/user', methods=['GET'])
def get_user():
    """
    Endpoint to check if the user is authenticated.
    """
    token = session.get('cvat_token')
    if not token:
        return jsonify({'authenticated': False}), 401
    
    return jsonify({'authenticated': True})