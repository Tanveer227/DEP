# backend/config.py (UPDATED)
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    # MongoDB connection settings
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://localhost:27017/dep_users'
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB max file size
    
    # Debugging line
    print("Loaded MONGO_URI:", MONGO_URI)
