import subprocess
import os
import logging

def run_inference_pipeline(nifti_path: str, output_dir: str, config: str) -> str:
    """Run nnUNet inference on a NIfTI file."""
    try:
        predictions_dir = os.path.join(output_dir, 'predictions')
        os.makedirs(predictions_dir, exist_ok=True)

        command = [
            'nnUNetv2_predict',
            '-i', nifti_path,
            '-o', predictions_dir,
            '-d', 'Dataset999',  # Replace with the correct trained model ID
            '-c', config,
            '-f', 'all',
            '--disable_tta'
        ]

        result = subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        logging.info(f"Inference completed: {result.stdout}")

        # Path to segmentation result
        result_path = os.path.join(predictions_dir, 'volume_seg.nii.gz')
        if not os.path.exists(result_path):
            raise FileNotFoundError("Segmentation output not generated.")

        return result_path

    except subprocess.CalledProcessError as e:
        error_msg = f"Inference failed: {e.stderr}"
        logging.error(error_msg)
        raise RuntimeError(error_msg)
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        raise
