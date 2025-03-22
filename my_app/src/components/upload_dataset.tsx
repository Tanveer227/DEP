"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, AlertCircle, ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileDetails {
  name: string;
  size: string;
  timestamp: string;
  studyId: string;
  status: string;
  type: string;
  estimatedImages: number;
}

const MedicalFileUploadDashboard: React.FC = () => {
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing uploads when component mounts
  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const username = localStorage.getItem('username'); // Assuming username is stored after login
      if (!username) return;

      const response = await fetch(`http://localhost:5328/uploads/uploads?username=${username}`);
      if (!response.ok) throw new Error('Failed to fetch uploads');
      
      const data = await response.json();
      setFiles(data.uploads);
    } catch (err) {
      console.error('Error fetching uploads:', err);
      setError('Failed to load existing uploads');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    await validateAndAddFile(droppedFile);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    await validateAndAddFile(selectedFile);
  };

  const validateAndAddFile = async (file?: File) => {
    setError('');
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please upload a ZIP file');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const username = localStorage.getItem('username');
      if (!username) {
        setError('User not authenticated');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', username);

      const response = await fetch('http://localhost:5328/uploads/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Add the new file to the list
      setFiles(prevFiles => [...prevFiles, {
        name: data.upload.file_name,
        size: data.upload.size,
        timestamp: data.upload.created_at,
        studyId: data.upload._id,
        status: data.upload.status,
        type: data.upload.type,
        estimatedImages: 0
      }]);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async (studyId: string) => {
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch(
        `http://localhost:5328/uploads/uploads/${studyId}?username=${username}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(prevFiles => prevFiles.filter(f => f.studyId !== studyId));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Upload ZIP files containing PNG or NIfTI (.nii/.nii.gz) images. Maximum file size: 500MB per ZIP.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-4xl">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <ImageIcon className="w-6 h-6" />
            Medical Image Archive Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50'}
              transition-colors`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg mb-2 font-medium text-gray-700">
              {isUploading ? 'Uploading...' : 'Upload Image Archive'}
            </p>
            <p className="text-sm text-gray-500">ZIP files containing PNG or NIfTI images</p>
            <p className="text-xs text-gray-400 mt-2">Maximum size: 500MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Uploaded Archives</h3>
              <div className="divide-y">
                {files.map((file) => (
                  <div key={file.studyId} className="py-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">Study ID: {file.studyId}</p>
                          <p className="text-sm text-gray-500">Status: {file.status}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(file.studyId)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                        disabled={isUploading}
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalFileUploadDashboard;
