from flask import Flask
from flask_cors import CORS
from auth.routes import auth_bp

def create_app():
    app = Flask(__name__)
    
    # Secret key for session management
    app.secret_key = "your-secret-key"
    
    # Add session cookie configuration here
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        SESSION_COOKIE_SECURE=False  # Set to True in production with HTTPS
    )
    
    # Enable CORS with credentials support
    CORS(app, supports_credentials=True)

    # Register authentication blueprint
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    @app.route('/')
    def index():
        return {'status': 'Flask backend is running'}
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5328, debug=True)