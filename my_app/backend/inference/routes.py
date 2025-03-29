from flask import Blueprint, request, jsonify
import uuid
import os
from utils.file_processing import process_upload
from utils.nnunet import run_inference_pipeline

inference_bp = Blueprint('inference', __name__)

TEMP_UPLOADS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'temp_uploads'))
TEMP_RESULTS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'temp_results'))

os.makedirs(TEMP_UPLOADS_PATH, exist_ok=True)
os.makedirs(TEMP_RESULTS_PATH, exist_ok=True)

@inference_bp.route('/upload', methods=['POST'])
def handle_upload():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
            
        file = request.files['file']
        config = request.form.get('config', '3d_fullres')
        
        if config not in ['2d', '3d_fullres']:
            return jsonify({'success': False, 'error': 'Invalid config'}), 400

        job_id = str(uuid.uuid4())
        job_dir = os.path.join(TEMP_UPLOADS_PATH, job_id)
        os.makedirs(job_dir, exist_ok=True)
        
        zip_path = os.path.join(job_dir, 'upload.zip')
        file.save(zip_path)
        
        # Process the zip file and extract the directory containing NIfTI files
        nifti_dir = process_upload(zip_path, job_dir)

        return jsonify({
            'success': True,
            'job_id': job_id,
            'config': config,
            'nifti_dir': nifti_dir
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@inference_bp.route('/run', methods=['POST'])
def handle_inference():
    try:
        data = request.json
        job_id = data.get('job_id')
        config = data.get('config', '3d_fullres')
        
        if not job_id or not config:
            return jsonify({'success': False, 'error': 'Missing parameters'}), 400

        input_dir = os.path.join(TEMP_UPLOADS_PATH, job_id)
        output_dir = os.path.join(TEMP_RESULTS_PATH, job_id)

        extracted_dir = os.path.join(input_dir, "extracted")
        if not os.path.exists(extracted_dir):
            return jsonify({'success': False, 'error': 'Extracted directory not found'}), 500

        extracted_subdirs = os.listdir(extracted_dir)
        if not extracted_subdirs:
            return jsonify({'success': False, 'error': 'No extracted folder found inside extracted/'}), 500

        nifti_dir = os.path.join(extracted_dir, extracted_subdirs[0])

        if not os.path.isdir(nifti_dir):
            return jsonify({'success': False, 'error': f'NIfTI directory not found at {nifti_dir}'}), 500
        
        results = run_inference_pipeline(
            nifti_path=nifti_dir,
            output_dir=output_dir,
            config=config,
            job_id=job_id
        )
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'output_dir': output_dir,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@inference_bp.route('/temp_results', methods=['GET'])
def get_temp_results():
    if not os.path.exists(TEMP_RESULTS_PATH):
        return jsonify({'success': False, 'error': f'Directory not found: {TEMP_RESULTS_PATH}'}), 404

    folder_names = [f for f in os.listdir(TEMP_RESULTS_PATH) if os.path.isdir(os.path.join(TEMP_RESULTS_PATH, f))]

    return jsonify({'success': True, 'folders': folder_names})
