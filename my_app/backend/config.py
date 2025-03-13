# backend/config.py
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:brynn@localhost:5432/dep_users')
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', 'development-secret-key')

    # Debugging line
    print("Loaded DATABASE_URL:", DATABASE_URL)