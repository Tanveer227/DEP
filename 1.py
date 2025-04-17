import nibabel as nib
import numpy as np

def compare_nii_files(file1, file2):
    """
    Compares two .nii.gz files by loading the image data and checking for equality.
    
    Returns:
      True if the image arrays are identical, False otherwise.
    """
    img1 = nib.load(file1)
    img2 = nib.load(file2)
    data1 = img1.get_fdata()
    data2 = img2.get_fdata()
    return np.array_equal(data1, data2)

# Example usage:
if __name__ == '__main__':
    file1 = "1.nii.gz"
    file2 = "2.nii.gz"
    if compare_nii_files(file1, file2):
        print("Files have the same image data.")
    else:
        print("Files differ in image data.")

