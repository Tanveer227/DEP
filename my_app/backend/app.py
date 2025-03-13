# backend/app.py
from flask import Flask
from flask_cors import CORS
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Explicit CORS configuration
    CORS(app, supports_credentials=True, resources={
        r"/auth/*": {
            "origins": "http://localhost:3000",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })

    # Import and register blueprint
    with app.app_context():
        from auth.routes import auth_bp
        app.register_blueprint(auth_bp, url_prefix='/auth')

    @app.route('/')
    def index():
        return {'status': 'Flask backend is running'}

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5328, debug=True)