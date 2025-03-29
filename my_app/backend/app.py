from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from auth.database import init_db
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Define folders dynamically
    base_dir = os.path.abspath(os.getcwd())
    app.config['UPLOAD_FOLDER'] = os.path.join(base_dir, 'backend', 'uploads')
    app.config['PREDICTIONS_FOLDER'] = os.path.join(base_dir, 'backend', 'predictions')
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

    # Ensure necessary directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['PREDICTIONS_FOLDER'], exist_ok=True)

    # CORS setup with better security
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    # Initialize database (MongoDB setup)
    init_db(app)

    # Register blueprints
    with app.app_context():
        from auth.routes import auth_bp
        from inference.routes import inference_bp  # Inference now handles temp_results functionality

        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(inference_bp, url_prefix='/inference')

    @app.route('/')
    def index():
        return jsonify({'status': 'Flask backend is running'})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5328, debug=True)
