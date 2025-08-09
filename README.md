# IntelliClinix
A comprehensive medical imaging annotation and AI inference platform that integrates CVAT (Computer Vision Annotation Tool) with nnUNet for automated medical image segmentation and annotation workflows with human-in-the-loop iterative improvement.

## 🏥 Overview

Intelliclinix is a full-stack web application designed for medical professionals and researchers to:
- Upload and process medical imaging data
- Run AI-powered segmentation using different image segmentation models
- Create annotation tasks in CVAT for manual review and correction
- Train custom models on corrected datasets and iteratively improve the model performance
- Currently supports Brain tumor (BRATS) and heart (left atrium) segmentation workflows

## 🏗️ Architecture

The system consists of two main components:

### Frontend (Next.js + TypeScript)
- **Framework**: Next.js 15 with App Router
- **State Management**: React hooks and local storage
- **Authentication**: Integrated with CVAT credentials

### Backend (Flask + Python)
- **Framework**: Flask 3.0 with Blueprint architecture
- **Database**: MongoDB for user management
- **AI Pipeline**: nnUNet v2 integration for BRATS and heart data
- **File Processing**: Supports NIfTI, PNG, TIFF, JPEG file formats for scan slices
- **CVAT Integration**: REST API for annotation workflow management

## 🚀 Features

- **Authentication**: Secure login with CVAT credentials
- **Multi-Dataset Support**: Brain tumor (BRATS) and heart (left atrium) segmentation
- **AI Inference**: Automated segmentation using pre-trained nnUNet models
- **Interactive Visualization**: Slice-by-slice image comparison with overlay options
- **Annotation Workflow**: CVAT integration for manual review and correction
- **Model Training**: Custom nnUNet model training on corrected datasets
- **File Management**: NIfTI file processing, conversion, and storage

## 📁 Project Structure

```
DEP/
├── my_app/                          # Main application directory
│   ├── backend/                     # Flask backend
│   │   ├── app.py                  # Main Flask application
│   │   ├── config.py               # Configuration and environment variables
│   │   ├── requirements.txt        # Python dependencies
│   │   ├── auth/                   # Authentication module
│   │   │   ├── routes.py          # Auth endpoints
│   │   │   ├── database.py        # MongoDB operations
│   │   │   └── cvat_auth.py       # CVAT authentication
│   │   ├── cvat/                  # CVAT integration
│   │   │   └── routes.py          # CVAT workflow endpoints
│   │   ├── inference/             # AI inference module
│   │   │   └── routes.py          # Inference endpoints
│   │   ├── nnunet/                # nnUNet integration
│   │   │   └── routes.py          # Training endpoints
│   │   └── utils/                 # Utility functions
│   │       ├── file_processing.py # File handling utilities
│   │       ├── inference.py       # Inference pipeline
│   │       └── nnunet.py         # nnUNet operations
│   ├── src/                       # Next.js frontend
│   │   ├── app/                   # App Router pages
│   │   │   ├── login/            # Authentication page
│   │   │   ├── newupload/        # File upload interface
│   │   │   ├── predictions/      # Inference results viewer
│   │   │   ├── corrected/        # Corrected annotations manager
│   │   │   └── preview_dataset/  # Dataset preview
│   │   ├── components/            # Reusable UI components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utility libraries
│   │   └── types/                 # TypeScript type definitions
│   ├── package.json               # Frontend dependencies
│   └── README.md                  # Frontend-specific documentation
├── 1.nii.gz                       # Sample NIfTI files
├── 2.nii.gz
└── README.md                      # This file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript 5.7**: Type-safe JavaScript
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Hot Toast**: Notification system

### Backend
- **Flask 3.0**: Python web framework
- **MongoDB**: NoSQL database with PyMongo
- **nnUNet v2**: Medical image segmentation framework
- **Nibabel**: NIfTI file processing
- **OpenCV**: Image processing and conversion
- **Pillow**: Python Imaging Library

## 📋 Prerequisites

### System Requirements
- Python 3.11+
- Node.js 18+
- MongoDB 4.0+
- nnUNet v2 installation
- CVAT account and API access

### nnUNet Setup
```bash
# Install nnUNet v2
pip install nnunetv2
```

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DEP
```

### 2. Backend Setup
```bash
cd my_app/backend

# Create virtual environment
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize MongoDB
# Ensure MongoDB is running and accessible
```

### 3. Frontend Setup
```bash
cd my_app

# Install dependencies
npm install
```


## 🏃‍♂️ Running the Application

### 1. Start Backend
```bash
cd my_app/backend
python app.py
```

### 2. Start Frontend
```bash
cd my_app
npm run dev
```

## 📖 Usage Guide

### 1. Authentication
- Navigate to the login page
- Use your CVAT credentials
- The system will authenticate with CVAT and create a local account

### 2. Upload Medical Images
- Select dataset type (Brain Tumor or Heart)
- Choose inference configuration (2D or 3D)
- Upload NIfTI files (`.nii.gz` format)
- Monitor processing progress

### 3. View AI Predictions
- Access the predictions page
- View segmentation results with original images
- Use interactive slice viewer with overlay options
- Compare different segmentation approaches

### 4. Annotation Workflow
- Send predictions to CVAT for manual review
- Annotators correct segmentation masks
- Download corrected annotations
- Integrate corrections back into the dataset

### 5. Model Training
- Select corrected tasks for training
- Choose training parameters (resolution, folds)
- Monitor training progress
- Use trained models for improved inference

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login with CVAT
- `GET /auth/user` - Get current user info
- `POST /auth/logout` - User logout

### File Management
- `POST /inference/upload` - Upload NIfTI files
- `GET /inference/nifti_files` - List uploaded files
- `POST /inference/run` - Execute AI inference

### CVAT Integration
- `POST /cvat/upload_tasks` - Create CVAT annotation tasks
- `GET /cvat/corrected-tasks` - List corrected annotations
- `POST /cvat/send-to-dataset` - Process corrected annotations

### nnUNet Training
- `POST /nnunet/train-nnunet` - Train custom models

## 🧠 Supported Datasets

### Dataset001_BrainTumour (BRATS)
- **Purpose**: Brain tumor segmentation
- **Channels**: 4 (T1, T1c, T2, FLAIR)
- **Labels**: Background, Edema, Non-enhancing tumor, Enhancing tumour
- **File Pattern**: `BRATS_XXX_XXXX.nii.gz` or `XXXX_0000.nii.gz`

### Dataset002_Heart
- **Purpose**: Left atrium segmentation
- **Channels**: 1 (MRI)
- **Labels**: Background, Left atrium
- **File Pattern**: `la_XXX_0000.nii.gz`

## 🐛 Troubleshooting

### Common Issues

1. **nnUNet Environment Variables**
   - Ensure all nnUNet paths are absolute and accessible
   - Check nnUNet v2 installation

2. **MongoDB Connection**
   - Verify MongoDB service is running
   - Check connection string in environment variables

3. **CVAT Authentication**
   - Verify CVAT credentials
   - Check CVAT API accessibility

4. **File Upload Issues**
   - Ensure NIfTI files are valid, or in other cases, the slices are properly zipped.

### Logs
- Backend logs are printed to console
- Check browser console for frontend errors
- Monitor network requests in browser dev tools