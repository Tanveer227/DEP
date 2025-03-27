# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from auth.database import init_db
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Add configuration for uploads and predictions directories
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['PREDICTIONS_FOLDER'] = 'predictions'
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    
    # Configure debug mode file watching
    if app.debug:
        extra_dirs = [
            os.path.join(app.root_path, 'uploads'),
            os.path.join(app.root_path, 'predictions')
        ]
        app.config['EXTRA_FILES'] = extra_dirs
    
    # Enhanced CORS configuration
    CORS(app, supports_credentials=True, resources={
        r"/auth/*": {
            "origins": "http://localhost:3000",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        },
        r"/inference/*": {
            "origins": "http://localhost:3000",
            "methods": ["GET", "POST", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        },
        r"/api/predictions": {
            "origins": "http://localhost:3000",
            "methods": ["GET"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Initialize MongoDB (if applicable)
    init_db(app)
    
    # Register blueprints
    with app.app_context():
        from auth.routes import auth_bp
        from auth.inference import inference_bp
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(inference_bp, url_prefix='/inference')

    # New prediction folders endpoint
    @app.route('/api/predictions', methods=['GET'])
    def get_prediction_folders():
        try:
            predictions_path = os.path.join(app.root_path, app.config['PREDICTIONS_FOLDER'])
            if not os.path.exists(predictions_path):
                os.makedirs(predictions_path)
                return jsonify({"folders": []})

            folders = []
            with os.scandir(predictions_path) as entries:
                for entry in entries:
                    if entry.is_dir() and not entry.name.startswith('.'):
                        folders.append(entry.name)
            
            return jsonify({"folders": sorted(folders)})
        
        except Exception as e:
            app.logger.error(f"Error fetching prediction folders: {str(e)}")
            return jsonify({"error": "Failed to retrieve prediction folders"}), 500

    @app.route('/')
    def index():
        return {'status': 'Flask backend is running'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5328, debug=True, extra_files=app.config.get('EXTRA_FILES', None))
