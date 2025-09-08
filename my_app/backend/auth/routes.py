from flask import Blueprint, request, jsonify, session
from bson.objectid import ObjectId
from .database import (
    get_users_collection,
    create_user,
    get_user_by_username,
    update_last_login,
)
import bcrypt

auth_bp = Blueprint('auth', __name__)


def serialize_objectid(data):
    if isinstance(data, dict):
        return {key: serialize_objectid(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_objectid(item) for item in data]
    elif isinstance(data, ObjectId):
        return str(data)
    return data


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    # Enforce simple length policy
    if len(username) < 3 or len(password) < 6:
        return jsonify({'error': 'Username must be >=3 chars and password >=6 chars'}), 400

    users = get_users_collection()
    if users.find_one({'username': username}):
        return jsonify({'error': 'Username already exists'}), 409

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = create_user(username, hashed_password)

    session.clear()
    session['username'] = user['username']

    return jsonify({
        'message': 'Signup successful',
        'user': serialize_objectid({k: v for k, v in user.items() if k != 'password'})
    }), 201


@auth_bp.route('/signin', methods=['POST'])
@auth_bp.route('/login', methods=['POST'])  # backwards compatibility
def signin():
    data = request.json or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = get_user_by_username(username)
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    stored_hash = user.get('password', '').encode('utf-8')
    if not stored_hash or not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
        return jsonify({'error': 'Invalid credentials'}), 401

    update_last_login(username)

    session.clear()
    session['username'] = username

    return jsonify({'message': 'Login successful', 'username': username}), 200


@auth_bp.route('/user', methods=['GET'])
def get_user():
    username = session.get('username')
    if not username:
        return jsonify({'authenticated': False}), 401

    user = get_user_by_username(username)
    if not user:
        return jsonify({'authenticated': False}), 401

    user.pop('password', None)
    serialized_user = serialize_objectid(user)

    return jsonify({'authenticated': True, 'user': serialized_user})


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200
