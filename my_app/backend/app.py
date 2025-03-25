<<<<<<< HEAD
from flask import Flask
from flask_cors import CORS
from config import Config
import os
=======
# backend/app.py (UPDATED)
from flask import Flask
from flask_cors import CORS
from config import Config
from auth.database import init_db
>>>>>>> da945fa98600bcb8ec754254fe533daba817eb8f

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
<<<<<<< HEAD
    # Create temp directories
    os.makedirs('temp_uploads', exist_ok=True)
    os.makedirs('temp_results', exist_ok=True)

    # Enhanced CORS configuration
=======
    # Add configuration to ignore uploads directory for reloading
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    if app.debug:
        import os
        extra_dirs = [os.path.join(app.root_path, 'uploads')]
        app.config['EXTRA_FILES'] = extra_dirs
        app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
    
    # Explicit CORS configuration
>>>>>>> da945fa98600bcb8ec754254fe533daba817eb8f
    CORS(app, supports_credentials=True, resources={
        r"/auth/*": {
            "origins": "http://localhost:3000",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        },
        r"/inference/*": {
            "origins": "http://localhost:3000",
<<<<<<< HEAD
            "methods": ["POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })

    # Register blueprints
    with app.app_context():
        from auth.routes import auth_bp
        from inference.routes import inference_bp
        
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(inference_bp, url_prefix='/inference')

=======
            "methods": ["GET", "POST", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Initialize MongoDB
    init_db(app)
    
    # Import and register blueprints
    with app.app_context():
        from auth.routes import auth_bp
        from auth.inference import inference_bp
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(inference_bp, url_prefix='/inference')
    
>>>>>>> da945fa98600bcb8ec754254fe533daba817eb8f
    @app.route('/')
    def index():
        return {'status': 'Flask backend is running'}
    
    return app

if __name__ == '__main__':
    app = create_app()
<<<<<<< HEAD
    app.run(host='127.0.0.1', port=5328, debug=True)
=======
    app.run(host='127.0.0.1', port=5328, debug=True, extra_files=app.config.get('EXTRA_FILES', None))
>>>>>>> da945fa98600bcb8ec754254fe533daba817eb8f
