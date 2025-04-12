#backend/utils/file_processing.py
import os
import zipfile
import nibabel as nib
import numpy as np
from PIL import Image
import shutil
import imageio

# def convert_nii_to_png(nifti_file, output_dir):
#     """Converts a NIfTI file to PNG images (slice by slice) and saves them."""
#     os.makedirs(output_dir, exist_ok=True)
    
#     try:
#         img = nib.load(nifti_file)  # Load NIfTI file
#         data = img.get_fdata()  # Get the 3D image data

#         # Normalize and convert each slice to PNG
#         for i in range(data.shape[2]):  # Iterate over slices
#             slice_data = data[:, :, i]

#             # Normalize data to 0-255
#             slice_data = (slice_data - np.min(slice_data)) / (np.max(slice_data) - np.min(slice_data) + 1e-5)
#             slice_data = (slice_data * 255).astype(np.uint8)

#             output_file = os.path.join(output_dir, f"slice_{i:03d}.png")
#             imageio.imwrite(output_file, slice_data)

#         return output_dir  # Return the directory containing PNG images

#     except Exception as e:
#         print(f"Error converting {nifti_file} to PNG: {e}")
#         return None

def process_upload(zip_path: str, output_dir: str) -> dict:
    """
    Extract and process uploaded ZIP file, handling both PNG slices and NIfTI files.
    Creates a temporary inference folder with ALL channels for processing.
    """
    # Create organized storage directories
    niftis_dir = os.path.join(output_dir, 'niftis')
    pngs_dir = os.path.join(output_dir, 'pngs')
    os.makedirs(niftis_dir, exist_ok=True)
    os.makedirs(pngs_dir, exist_ok=True)
    
    # Extract unique job ID from zip filename
    job_id = os.path.basename(zip_path).split('.')[0]
    
    # Create temporary extraction directory
    temp_extract_dir = os.path.join(output_dir, f'temp_extract_{job_id}')
    if os.path.exists(temp_extract_dir):
        shutil.rmtree(temp_extract_dir)
    os.makedirs(temp_extract_dir, exist_ok=True)
    
    # Create a separate directory for inference that will contain ALL channels
    inference_dir = os.path.join(output_dir, f'inference_temp_{job_id}')
    if os.path.exists(inference_dir):
        shutil.rmtree(inference_dir)
    os.makedirs(inference_dir, exist_ok=True)
    
    # Extract ZIP contents
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(temp_extract_dir)
    
    # Initialize result paths
    result = {
        'nifti_paths': [],
        'png_dirs': [],
        'job_id': job_id,
        'inference_dir': inference_dir  # Include inference directory in results
    }
    
    # Find ALL NIfTI files (no filtering by channel)
    all_nifti_files = []
    channel0_nifti_files = []
    
    for root, _, files in os.walk(temp_extract_dir):
        for file in files:
            if file.lower().endswith(('.nii', '.nii.gz')):
                full_path = os.path.join(root, file)
                all_nifti_files.append(full_path)
                
                # Check if this is channel 0 for archiving
                filename, ext = os.path.splitext(file)
                if ext == '.gz':
                    filename, _ = os.path.splitext(filename)  # Handle .nii.gz
                
                # Identify channel 0 files for regular storage
                if filename.endswith('_0000') or not any(d.isdigit() for d in filename.split('_')[-1]):
                    channel0_nifti_files.append(full_path)
    
    # Find PNG folders
    png_folders = set()
    for root, _, files in os.walk(temp_extract_dir):
        png_files = [f for f in files if f.lower().endswith('.png')]
        if png_files:
            png_folders.add(root)
    
    # Copy ALL NIfTI files to inference directory (including all channels)
    for nifti_file in all_nifti_files:
        file_name = os.path.basename(nifti_file)
        inference_path = os.path.join(inference_dir, file_name)
        shutil.copy2(nifti_file, inference_path)
        print(f"Copied {file_name} to inference directory")
    
    # Process channel 0 NIfTI files for regular storage
    for src_nifti in channel0_nifti_files:
        file_name = os.path.basename(src_nifti)
        base_name = os.path.splitext(file_name)[0]
        if base_name.lower().endswith('.nii'):
            base_name = os.path.splitext(base_name)[0]  # Handle .nii.gz
            
        # Copy NIfTI file to niftis directory (only channel 0)
        dest_nifti = os.path.join(niftis_dir, f"{job_id}_{file_name}")
        shutil.copy2(src_nifti, dest_nifti)
        result['nifti_paths'].append(dest_nifti)
        
        # Create PNG directory for this NIfTI file and convert
        png_subfolder = os.path.join(pngs_dir, f"{job_id}_{base_name}")
        os.makedirs(png_subfolder, exist_ok=True)
        nifti_to_png_slices(src_nifti, png_subfolder)
        result['png_dirs'].append(png_subfolder)
    
    # Process PNG folders if found (and no NIfTI files were found)
    if png_folders and not all_nifti_files:
        for png_folder in png_folders:
            folder_name = os.path.basename(png_folder)
            
            # Create job directory in pngs folder
            png_job_dir = os.path.join(pngs_dir, f"{job_id}_{folder_name}")
            os.makedirs(png_job_dir, exist_ok=True)
            
            # Copy PNG files to the job directory
            png_files = [os.path.join(png_folder, f) for f in os.listdir(png_folder) 
                        if f.lower().endswith('.png')]
            
            for png_file in png_files:
                dest_png = os.path.join(png_job_dir, os.path.basename(png_file))
                shutil.copy2(png_file, dest_png)
            
            result['png_dirs'].append(png_job_dir)
            
            # Convert PNGs to NIfTI
            dest_nifti = os.path.join(niftis_dir, f"{job_id}_{folder_name}.nii.gz")
            convert_to_nifti(png_job_dir, dest_nifti)
            result['nifti_paths'].append(dest_nifti)
            
            # Also copy the converted NIfTI to the inference directory
            inference_nifti = os.path.join(inference_dir, f"{folder_name}.nii.gz")
            shutil.copy2(dest_nifti, inference_nifti)
    
    # Clean up extraction directory
    shutil.rmtree(temp_extract_dir)
    if os.path.exists(zip_path):
        os.remove(zip_path)
    
    # Validate results
    if not result['nifti_paths'] and not os.listdir(inference_dir):
        # Clean up empty inference directory
        shutil.rmtree(inference_dir)
        raise ValueError("No valid PNG slices or NIfTI files found in uploaded ZIP.")
    
    # For backward compatibility
    if result['nifti_paths']:
        result['nifti_path'] = result['nifti_paths'][0]
    if result['png_dirs']:
        result['png_dir'] = result['png_dirs'][0]
    
    return result

def convert_to_nifti(png_dir: str, output_path: str = None) -> str:
    """
    Convert a directory of PNG slices to a NIfTI file.
    
    Parameters:
    -----------
    png_dir : str
        Directory containing PNG slices to convert.
    output_path : str, optional
        Path where the output NIfTI file will be saved. If None, a default path will be generated.
        
    Returns:
    --------
    str
        Path to the saved NIfTI file.
    """
    # Find all PNG files in the directory
    png_files = sorted(glob(os.path.join(png_dir, "*.png")))
    
    if not png_files:
        raise ValueError(f"No PNG files found in {png_dir}")
    
    print(f"Found {len(png_files)} PNG files to convert")
    
    # Read the first image to get dimensions
    first_image = np.array(Image.open(png_files[0]))
    height, width = first_image.shape[:2]
    
    # Determine if images are grayscale or RGB
    is_grayscale = len(first_image.shape) == 2
    
    # Create empty 3D array to hold all slices
    if is_grayscale:
        volume = np.zeros((width, height, len(png_files)), dtype=np.float32)
    else:
        # For RGB images, convert to grayscale for medical imaging
        volume = np.zeros((width, height, len(png_files)), dtype=np.float32)
    
    # Load all PNG files into the 3D array
    for i, png_file in enumerate(png_files):
        img = Image.open(png_file)
        if not is_grayscale:
            # Convert RGB to grayscale if needed
            img = img.convert('L')
        
        # Convert to numpy array and normalize to 0-1 range
        img_array = np.array(img, dtype=np.float32)
        if img_array.max() > 0:
            img_array = img_array / img_array.max()
        
        # Add to volume (with correct orientation for medical imaging)
        volume[:, :, i] = img_array.T
    
    # Create affine matrix (4x4 identity is a simple default)
    affine = np.eye(4)
    
    # Create NIfTI image object
    nifti_image = nib.Nifti1Image(volume, affine)
    
    # Set datatype to float32
    nifti_image.set_data_dtype(np.float32)
    
    # Generate output path if not provided
    if output_path is None:
        output_path = os.path.join(os.path.dirname(png_dir), f"{os.path.basename(png_dir)}.nii.gz")
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save the NIfTI file
    nib.save(nifti_image, output_path)
    
    print(f"Successfully converted PNG slices to NIfTI file: {output_path}")
    
    return output_path

def nifti_to_png_slices(nifti_path: str, output_dir: str, use_viridis=True) -> str:
    """
    Convert a NIfTI file to a series of PNG slices with viridis colormap.
    """
    import matplotlib.pyplot as plt
    from matplotlib.colors import LinearSegmentedColormap
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Load the NIfTI file
    nifti_img = nib.load(nifti_path)
    
    # Get the data array
    data = nifti_img.get_fdata()
    
    # Create viridis colormap with transparency for zeros
    if use_viridis:
        # Get viridis colormap
        viridis = plt.cm.get_cmap('viridis')
        
        # Modify it to make zeros (background) transparent
        viridis_transparent = viridis(np.arange(viridis.N))
        viridis_transparent[:, 3] = np.linspace(0, 1, viridis.N)  # Alpha channel
        viridis_transparent[0, 3] = 0  # Make the lowest value fully transparent
        viridis_transparent = LinearSegmentedColormap.from_list('viridis_transparent', 
                                                              viridis_transparent)
    
    # Determine the appropriate axis for slicing
    num_slices = data.shape[2]  # Assuming standard radiological orientation
    
    # Generate PNG slices
    for i in range(num_slices):
        # Extract slice
        slice_data = data[:, :, i].T
        
        if use_viridis:
            # Create a figure with transparent background
            fig = plt.figure(figsize=(10, 10), frameon=False)
            ax = fig.add_subplot(111)
            ax.set_axis_off()
            
            # Plot with viridis colormap
            im = ax.imshow(slice_data, cmap=viridis_transparent)
            
            # Remove margins
            plt.subplots_adjust(top=1, bottom=0, right=1, left=0, hspace=0, wspace=0)
            plt.margins(0, 0)
            
            # Save with transparency
            slice_path = os.path.join(output_dir, f"slice_{i:04d}.png")
            plt.savefig(slice_path, bbox_inches='tight', pad_inches=0, 
                       transparent=True, format='png', dpi=100)
            plt.close(fig)
        else:
            # Original method for non-viridis
            # Normalize to 0-255 range
            normalized_slice = 255 * ((slice_data - slice_data.min()) / 
                                    (slice_data.max() - slice_data.min() + 1e-6))
            
            # Convert to 8-bit unsigned integer
            slice_uint8 = normalized_slice.astype(np.uint8)
            
            # Create and save image
            img = Image.fromarray(slice_uint8)
            slice_path = os.path.join(output_dir, f"slice_{i:04d}.png")
            img.save(slice_path)
    
    print(f"Successfully converted NIfTI to {num_slices} PNG slices with viridis colormap in: {output_dir}")
    
    return output_dir