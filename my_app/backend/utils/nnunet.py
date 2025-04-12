import subprocess
import os
import logging
import glob

def run_inference_pipeline(input_dir: str, output_dir: str, config: str, job_id: str) -> dict:
    """
    Run nnUNet inference on all NIfTI files in the specified directory.
    
    Parameters:
    -----------
    input_dir : str
        Directory containing NIfTI files to process (including all channels)
    output_dir : str
        Directory where inference results will be saved
    config : str
        Configuration for inference ('2d' or '3d_fullres')
    job_id : str
        Unique identifier for the job
    """
    try:
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"Processing input directory: {input_dir}")
        print(f"Absolute path: {os.path.abspath(input_dir)}")
        print(f"Directory exists? {os.path.exists(input_dir)}")
        print(f"Directory contents: {os.listdir(input_dir)}")
        print(f"Output directory: {output_dir}")
        
        # Verify the input directory is valid
        if not os.path.isdir(input_dir):
            raise ValueError(f"Input path is not a directory: {input_dir}")
        
        # Find all NIfTI files in the input directory
        nifti_files = []
        for ext in ['.nii', '.nii.gz']:
            nifti_files.extend(glob.glob(os.path.join(input_dir, f"*{ext}")))
        
        if not nifti_files:
            error_msg = f"No NIfTI files found in directory: {input_dir}"
            logging.error(error_msg)
            raise ValueError(error_msg)
            
        print(f"Found {len(nifti_files)} NIfTI file(s) to process: {[os.path.basename(f) for f in nifti_files]}")
        
        # Ensure nnUNet environment variables are set with absolute paths
        env = os.environ.copy()
        env["NNUNET_RAW_DATA_BASE"] = os.path.expanduser(os.getenv("NNUNET_RAW_DATA_BASE", "~/Development/DEP_electrical/nnUNet_raw"))
        env["NNUNET_PREPROCESSED"] = os.path.expanduser(os.getenv("NNUNET_PREPROCESSED", "~/Development/DEP_electrical/nnUNet_preprocessed"))
        env["NNUNET_RESULTS_FOLDER"] = os.path.expanduser(os.getenv("NNUNET_RESULTS_FOLDER", "~/Development/DEP_electrical/nnUNet_results"))
        
        # Run nnUNet inference on the directory containing all channels
        command = [
            'nnUNetv2_predict',
            '-i', input_dir,
            '-o', output_dir,
            '-d', 'Dataset001_BrainTumour',  # Adjust dataset as needed
            '-c', config,
            '-f', 'all',
            '--disable_tta'
        ]
        
        print(f"Running command: {' '.join(command)}")
        
        result = subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env
        )
        
        logging.info(f"Inference completed successfully: {result.stdout}")
        
        # Find output files
        output_files = glob.glob(os.path.join(output_dir, "*.nii.gz"))
        
        return {
            'job_id': job_id,
            'status': 'success',
            'output_dir': output_dir,
            'log': result.stdout,
            'output_files': output_files
        }
            
    except subprocess.CalledProcessError as e:
        error_msg = f"Inference failed: {e.stderr}"
        logging.error(error_msg)
        return {
            'job_id': job_id,
            'status': 'failed',
            'error': error_msg
        }
    except Exception as e:
        error_msg = f"Unexpected error during inference: {str(e)}"
        logging.error(error_msg)
        return {
            'job_id': job_id,
            'status': 'failed',
            'error': error_msg
        }
