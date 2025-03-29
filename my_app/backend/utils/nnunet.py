import subprocess
import os
import logging
import zipfile

def run_inference_pipeline(nifti_path: str, output_dir: str, config: str, job_id:str) -> str:
    """Run nnUNet inference on a NIfTI file."""
    try:
        print(f"Checking input file: {nifti_path}")
        print(f"Absolute path: {os.path.abspath(nifti_path)}")
        print(f"File exists? {os.path.exists(nifti_path)}")
        print(f"Output directory: {output_dir}")

        # Ensure nnUNet environment variables are set
        env = os.environ.copy()
        env["NNUNET_RAW_DATA_BASE"] = os.getenv("NNUNET_RAW_DATA_BASE", "~/Development/DEP_electrical/nnUNet_raw")
        env["NNUNET_PREPROCESSED"] = os.getenv("NNUNET_PREPROCESSED", ".~/Development/DEP_electrical/nnUNet_preprocessed")
        env["NNUNET_RESULTS_FOLDER"] = os.getenv("NNUNET_RESULTS_FOLDER", "~/Development/DEP_electrical/nnUNet_results")

        command = [
            'nnUNetv2_predict',
            '-i', nifti_path,
            '-o', output_dir,
            '-d', 'Dataset001_BrainTumour',  # Replace with the correct trained model ID
            '-c', config,
            '-f', 'all',
            '--disable_tta'
        ]

        result = subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env  # Pass the updated environment
        )

        logging.info(f"Inference completed: {result.stdout}")

        return output_dir

    except subprocess.CalledProcessError as e:
        error_msg = f"Inference failed: {e.stderr}"
        logging.error(error_msg)
        raise RuntimeError(error_msg)
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        raise
