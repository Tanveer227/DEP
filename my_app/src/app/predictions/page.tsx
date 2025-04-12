"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import DashboardNav from "@/components/DashboardNav";

export default function PredictionsPage() {
  const [selectedNiftis, setSelectedNiftis] = useState<string[]>([]);
  const [niftiFiles, setNiftiFiles] = useState<{
    id: string;
    filename: string;
    jobId: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // CVAT credential modal state
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [cvatUsername, setCvatUsername] = useState("");
  const [cvatPassword, setCvatPassword] = useState("");
  
  // Gallery state
  const [showGallery, setShowGallery] = useState(false);
  const [currentSliceIndex, setCurrentSliceIndex] = useState<number>(0);
  const [gallerySlices, setGallerySlices] = useState<{
    original: string[];
    result: string[];
    totalSlices: number;
  }>({ original: [], result: [], totalSlices: 0 });
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  const [selectedNiftiForGallery, setSelectedNiftiForGallery] = useState<string | null>(null);
  const [useScreenBlend, setUseScreenBlend] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    fetchNiftiFiles();
  }, []);

  const fetchNiftiFiles = async () => {
    setIsFetchingFiles(true);
    try {
      const response = await fetch("http://localhost:5328/inference/nifti_files", {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch NIfTI files");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch NIfTI files");
      }
      
      setNiftiFiles(data.nifti_files || []);
    } catch (error) {
      console.error("Error fetching NIfTI files:", error);
      toast.error("Failed to load NIfTI files");
    } finally {
      setIsFetchingFiles(false);
    }
  };

  const toggleNiftiSelection = (niftiId: string) => {
    setSelectedNiftis((prev) =>
      prev.includes(niftiId) 
        ? prev.filter((id) => id !== niftiId) 
        : [...prev, niftiId]
    );
  };

  const handleGalleryOpen = async (niftiId: string, jobId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5328/inference/comparison_slices?nifti_id=${niftiId}&job_id=${jobId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch comparison slices");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch comparison slices");
      }
      
      setGallerySlices({
        original: data.original_slices || [],
        result: data.result_slices || [],
        totalSlices: data.original_slices?.length || 0
      });
      
      setCurrentSliceIndex(0);
      setShowGallery(true);
      setSelectedNiftiForGallery(niftiId);
    } catch (error) {
      console.error("Error fetching comparison slices:", error);
      toast.error("Failed to load comparison images");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateSlice = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentSliceIndex < gallerySlices.totalSlices - 1) {
      setCurrentSliceIndex(currentSliceIndex + 1);
    } else if (direction === 'prev' && currentSliceIndex > 0) {
      setCurrentSliceIndex(currentSliceIndex - 1);
    }
  };

  // New functions for CVAT integration
  const handleSendToCVAT = () => {
    if (selectedNiftis.length === 0) {
      toast.error("Please select at least one file to send to CVAT");
      return;
    }
    setShowCredentialsModal(true);
  };
  
  const handleDiscardFiles = async () => {
    if (selectedNiftis.length === 0) {
      toast.error("Please select at least one file to discard");
      return;
    }
    
    if (!confirm("Are you sure you want to discard the selected files? This action cannot be undone.")) {
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:5328/cvat/discard_files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nifti_ids: selectedNiftis
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to discard files");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to discard files");
      }
      
      toast.success("Files discarded successfully");
      setSelectedNiftis([]);
      fetchNiftiFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error discarding files:", error);
      toast.error("Failed to discard files");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCVATCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await fetch("http://localhost:5328/cvat/upload_tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nifti_ids: selectedNiftis,
          cvat_username: cvatUsername,
          cvat_password: cvatPassword
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send to CVAT");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to send to CVAT");
      }
      
      toast.success(`Successfully sent ${selectedNiftis.length} task(s) to CVAT`);
      setShowCredentialsModal(false);
      setSelectedNiftis([]);
    } catch (error) {
      console.error("Error sending to CVAT:", error);
      toast.error(`Failed to send to CVAT: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 flex flex-col">
      <DashboardNav />
      
      <div className="flex flex-1 w-full max-w-7xl mx-auto p-4">
        {/* Main content area */}
        <main className="flex-1 pr-4">
          <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-gray-900 text-center">
              Medical Scan Predictions
            </h2>
            
            {isFetchingFiles ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : niftiFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {niftiFiles.map((nifti) => (
                  <div 
                    key={nifti.id} 
                    className={`p-4 rounded-lg border transition ${
                      selectedNiftis.includes(nifti.id) 
                        ? "bg-blue-50 border-blue-300" 
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-800 truncate" title={nifti.filename}>
                          {nifti.filename}
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                          {nifti.jobId}
                        </span>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => handleGalleryOpen(nifti.id, nifti.jobId)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                          disabled={isLoading}
                        >
                          {isLoading && selectedNiftiForGallery === nifti.id ? (
                            <span className="mr-2 h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span>
                          ) : (
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          )}
                          Compare Slices
                        </button>
                        
                        <button
                          onClick={() => toggleNiftiSelection(nifti.id)}
                          className={`px-3 py-1 rounded-lg text-white font-semibold transition ${
                            selectedNiftis.includes(nifti.id)
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {selectedNiftis.includes(nifti.id) ? "Deselect" : "Select"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No prediction results found.</p>
                <button 
                  onClick={() => router.push('/newupload')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                >
                  Upload New Scan
                </button>
              </div>
            )}
          </div>
        </main>
        
        {/* Right panel for actions */}
        <div className="w-64 bg-white shadow-xl rounded-xl p-4 border border-gray-200 h-fit sticky top-4">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Selected Files</h3>
            <p className="text-sm text-gray-600">
              {selectedNiftis.length} file(s) selected
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleSendToCVAT}
              disabled={selectedNiftis.length === 0 || isProcessing}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              )}
              Send to CVAT
            </button>
            
            <button
              onClick={handleDiscardFiles}
              disabled={selectedNiftis.length === 0 || isProcessing}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              )}
              Discard Files
            </button>
          </div>
        </div>
      </div>
      
      {/* CVAT Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl relative max-w-md w-full">
            <button
              onClick={() => setShowCredentialsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">CVAT Credentials</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your CVAT credentials to upload selected files as tasks.
            </p>
            
            <form onSubmit={handleCVATCredentialsSubmit} className="space-y-4">
              <div>
                <label htmlFor="cvat-username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="cvat-username"
                  type="text"
                  value={cvatUsername}
                  onChange={(e) => setCvatUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="cvat-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="cvat-password"
                  type="password"
                  value={cvatPassword}
                  onChange={(e) => setCvatPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                ) : "Upload to CVAT"}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Comparison Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl relative max-w-5xl w-full flex flex-col h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Slice Comparison - {currentSliceIndex + 1} of {gallerySlices.totalSlices}
              </h3>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Overlay Opacity:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="w-24"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={useScreenBlend}
                      onChange={() => setUseScreenBlend(!useScreenBlend)}
                      className="mr-1"
                    />
                    Transparent Background
                  </label>
                </div>
                
                <button
                  onClick={() => setShowGallery(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {/* Original image as background */}
              {gallerySlices.original[currentSliceIndex] && (
                <img 
                  src={gallerySlices.original[currentSliceIndex]} 
                  alt={`Original slice ${currentSliceIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-contain z-[1]"
                />
              )}
              
              {/* Result image as overlay */}
              {gallerySlices.result[currentSliceIndex] && (
                <img 
                  src={gallerySlices.result[currentSliceIndex]} 
                  alt={`Result slice ${currentSliceIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-contain z-[2]"
                  style={{ 
                    opacity: overlayOpacity,
                    mixBlendMode: useScreenBlend ? 'screen' : 'normal'
                  }}
                />
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => navigateSlice('prev')}
                disabled={currentSliceIndex === 0}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 transition flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous
              </button>
              
              <div className="text-center text-gray-600">
                <span className="font-medium">Slice {currentSliceIndex + 1}</span> of {gallerySlices.totalSlices}
              </div>
              
              <button
                onClick={() => navigateSlice('next')}
                disabled={currentSliceIndex === gallerySlices.totalSlices - 1}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 transition flex items-center"
              >
                Next
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
