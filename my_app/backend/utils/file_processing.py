import os
import zipfile
import nibabel as nib
import numpy as np
from PIL import Image
import shutil

def process_upload(zip_path: str, output_dir: str) -> str:
    """Extract and process uploaded ZIP file"""
    png_dir = os.path.join(output_dir, 'slices')
    os.makedirs(png_dir, exist_ok=True)
    
    # Extract ZIP file
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(png_dir)
    
    # Verify extraction
    png_files = [f for f in os.listdir(png_dir) if f.lower().endswith('.png')]
    if not png_files:
        raise ValueError("No PNG files found in uploaded ZIP")
    
    return png_dir

def convert_to_nifti(png_dir: str, output_dir: str) -> str:
    """Convert PNG slices to 3D NIfTI volume"""
    # Get sorted list of PNG files
    png_files = sorted(
        [f for f in os.listdir(png_dir) if f.endswith('.png')],
        key=lambda x: int(x.split('_')[-1].split('.')[0])
    )
    
    # Read slices into 3D array
    volume = []
    for png_file in png_files:
        img = Image.open(os.path.join(png_dir, png_file))
        volume.append(np.array(img))
    
    # Create NIfTI image
    nifti_img = nib.Nifti1Image(np.stack(volume, axis=-1), affine=np.eye(4))
    nifti_path = os.path.join(output_dir, 'volume.nii.gz')
    nib.save(nifti_img, nifti_path)
    
    return nifti_path
