import os
import subprocess
from flask import Blueprint, current_app, request, jsonify

nnunet_bp = Blueprint('nnunet', __name__, url_prefix='/nnunet')

@nnunet_bp.route('/train-nnunet', methods=['POST'])
def train_nnunet():
    """
    Expects a JSON payload:
    {
        "resolution": "2d" OR "3d" OR "3d_fullres",
        "fold": <fold_number>
    }
    
    This endpoint runs the nnUNet preprocessing and one-epoch training commands.
    It uses the dataset "Dataset001_BrainTumor" (hardcoded) and nnUNetV2 trainers.
    """
    try:
        data = request.get_json()
        resolution = data.get("resolution", "3d_fullres")
        fold = int(data.get("fold", 0))
        
        if resolution not in ["2d", "3d", "3d_fullres"]:
            return jsonify({"error": "Unsupported resolution. Choose from 2d, 3d, 3d_fullres."}), 400
        
        # Hardcoded dataset name as requested.
        dataset = "Dataset001_BrainTumor"
        
        # Determine current working directory as the base directory for running commands.
        base_dir = os.path.abspath("")
        
        # ----------------- Preprocessing -----------------
        # Build the preprocessing command.
        # Here we pass the resolution (which nnUNet_plan_and_preprocess accepts as planning mode).
        preprocess_command = [
            "nnUNet_plan_and_preprocess",
            "-t", dataset,
            "-pl", resolution
        ]
        current_app.logger.info("Running preprocessing: %s in %s", " ".join(preprocess_command), base_dir)
        subprocess.run(preprocess_command, check=True, cwd=base_dir)
        
        # ----------------- Training -----------------
        # Map the resolution to the appropriate network/trainer parameters.
        if resolution == "2d":
            network = "2d"
            trainer = "nnUNetTrainerV2_2D"
        elif resolution == "3d":
            network = "3d_lowres"
            trainer = "nnUNetTrainerV2"
        else:  # resolution == "3d_fullres"
            network = "3d_fullres"
            trainer = "nnUNetTrainerV2"
        
        # Build the training command to run a one-epoch training run.
        # The command pattern is:
        #    nnUNet_train <network> <trainer> <task> <fold> --max_epochs 1
        train_command = [
            "nnUNet_train",
            network,
            trainer,
            dataset,
            str(fold),
            "--max_epochs",
            "1"
        ]
        current_app.logger.info("Running training: %s in %s", " ".join(train_command), base_dir)
        subprocess.run(train_command, check=True, cwd=base_dir)
        
        return jsonify({
            "message": f"Training completed for dataset {dataset}, resolution {resolution}, fold {fold} (1 epoch)."
        }), 200
    except subprocess.CalledProcessError as cpe:
        current_app.logger.error("Subprocess error during training: %s", str(cpe))
        return jsonify({"error": f"Subprocess error: {str(cpe)}"}), 500
    except Exception as e:
        current_app.logger.error("Unexpected error in training: %s", str(e))
        return jsonify({"error": str(e)}), 500