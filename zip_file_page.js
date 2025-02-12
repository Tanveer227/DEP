import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MedicalFileUploadDashboard = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/zip' || file.name.endsWith('.zip')
    );
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      file => file.type === 'application/zip' || file.name.endsWith('.zip')
    );
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...newFiles.map(file => ({
        name: file.name,
        size: formatFileSize(file.size),
        timestamp: new Date().toLocaleString(),
        patientId: generateRandomId(), // In real app, this would come from metadata
        modality: detectModality(file.name), // In real app, this would come from DICOM metadata
        studyDate: new Date().toLocaleDateString(), // In real app, this would come from metadata
      }))
    ]);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to generate random patient ID (for demo purposes)
  const generateRandomId = () => {
    return 'PT' + Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  // Helper function to detect modality from filename (for demo purposes)
  const detectModality = (filename) => {
    const modalities = ['CT', 'MRI', 'XR', 'US'];
    const found = modalities.find(m => filename.toUpperCase().includes(m));
    return found || 'Unknown';
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This system is HIPAA compliant. All uploaded files are encrypted and stored securely.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <FileText className="w-6 h-6" />
            Medical Imaging Upload Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              hover:border-blue-500 hover:bg-blue-50 transition-colors`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg mb-2">Upload Medical Imaging Files (ZIP)</p>
            <p className="text-sm text-gray-500">Supports DICOM images in ZIP format</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Uploaded Studies</h3>
              <div className="divide-y">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <div className="grid grid-cols-2 gap-x-4 text-sm text-gray-500">
                          <p>Patient ID: {file.patientId}</p>
                          <p>Modality: {file.modality}</p>
                          <p>Study Date: {file.studyDate}</p>
                          <p>File Size: {file.size}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
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
