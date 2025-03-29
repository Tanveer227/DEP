from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://localhost:27017/dep_users'
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    
    # nnUNet paths
    NNUNET_RAW_DATA_BASE = os.environ.get('NNUNET_RAW_DATA_BASE') or '~/Development/DEP_electrical/nnUNet_raw'
    NNUNET_PREPROCESSED = os.environ.get('NNUNET_PREPROCESSED') or '~/Development/DEP_electrical/nnUNet_preprocessed'
    NNUNET_RESULTS_FOLDER = os.environ.get('NNUNET_RESULTS_FOLDER') or '~/Development/DEP_electrical/nnUNet_results'
    
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB max file size
    
    print("Loaded MONGO_URI:", MONGO_URI)
