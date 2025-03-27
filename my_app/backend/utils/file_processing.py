import os
import zipfile
import nibabel as nib
import numpy as np
from PIL import Image
import shutil

def process_upload(zip_path: str, output_dir: str) -> str:
    """Extract and check contents of the uploaded ZIP file."""
    extracted_dir = os.path.join(output_dir, 'extracted')
    os.makedirs(extracted_dir, exist_ok=True)
    
    # Extract ZIP file
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extracted_dir)

    # Check for PNG slices or NIfTI files
    png_dirs = []
    nifti_files = []

    for root, _, files in os.walk(extracted_dir):
        png_files = sorted([f for f in files if f.lower().endswith('.png')])
        nifti_files.extend([os.path.join(root, f) for f in files if f.lower().endswith(('.nii', '.nii.gz'))])
        
        if png_files:
            png_dirs.append(root)

    if nifti_files:
        return nifti_files[0]  # Return the first found NIfTI file for inference

    if png_dirs:
        return convert_to_nifti(png_dirs[0], output_dir)  # Convert PNG slices to NIfTI

    raise ValueError("No valid PNG slices or NIfTI files found in uploaded ZIP.")

def convert_to_nifti(png_dir: str, output_dir: str) -> str:
    """Convert PNG slices to a 3D NIfTI volume."""
    png_files = sorted(
        [f for f in os.listdir(png_dir) if f.endswith('.png')],
        key=lambda x: int(x.split('_')[-1].split('.')[0])
    )
    
    if not png_files:
        raise ValueError("No PNG files found in directory.")

    # Read slices into 3D array
    volume = [np.array(Image.open(os.path.join(png_dir, png_file))) for png_file in png_files]

    # Create NIfTI image
    nifti_img = nib.Nifti1Image(np.stack(volume, axis=-1), affine=np.eye(4))
    nifti_path = os.path.join(output_dir, 'volume.nii.gz')
    nib.save(nifti_img, nifti_path)
    
    return nifti_path
