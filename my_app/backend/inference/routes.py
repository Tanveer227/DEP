from flask import Blueprint, request, jsonify, send_file
import uuid
import os
from utils.file_processing import process_upload, convert_to_nifti
from utils.nnunet import run_inference_pipeline

inference_bp = Blueprint('inference', __name__)

@inference_bp.route('/upload', methods=['POST'])
def handle_upload():
    try:
        # Authentication check
        auth_check = request.headers.get('Authorization')
        if not auth_check or auth_check != f"Bearer {os.environ.get('API_KEY')}":
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401

        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
            
        file = request.files['file']
        config = request.form.get('config', '3d_fullres')
        
        # Validate config
        if config not in ['2d', '3d_fullres']:
            return jsonify({'success': False, 'error': 'Invalid config'}), 400

        # Create job directory
        job_id = str(uuid.uuid4())
        job_dir = os.path.join('temp_uploads', job_id)
        os.makedirs(job_dir, exist_ok=True)
        
        # Save uploaded file
        zip_path = os.path.join(job_dir, 'upload.zip')
        file.save(zip_path)
        
        # Process files
        png_dir = process_upload(zip_path, job_dir)
        nifti_path = convert_to_nifti(png_dir, job_dir)
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'config': config
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@inference_bp.route('/run', methods=['POST'])
def handle_inference():
    try:
        # Authentication check
        auth_check = request.headers.get('Authorization')
        if not auth_check or auth_check != f"Bearer {os.environ.get('API_KEY')}":
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401

        data = request.json
        job_id = data.get('job_id')
        config = data.get('config', '3d_fullres')
        
        # Validate inputs
        if not job_id or not config:
            return jsonify({'success': False, 'error': 'Missing parameters'}), 400

        # Path setup
        input_dir = os.path.join('temp_uploads', job_id)
        output_dir = os.path.join('temp_results', job_id)
        nifti_path = os.path.join(input_dir, 'volume.nii.gz')
        
        # Run inference
        result_path = run_inference_pipeline(
            nifti_path=nifti_path,
            output_dir=output_dir,
            config=config
        )
        
        # Return result file
        return send_file(
            result_path,
            as_attachment=True,
            download_name=f'result_{job_id}.nii.gz'
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
