"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import DashboardNav from "@/components/DashboardNav";

export default function NewUploadPage() {
  const router = useRouter();
  const [config, setConfig] = useState<"2d" | "3d_fullres">("3d_fullres");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const skipAuth = localStorage.getItem("skipAuth");
    if (skipAuth === "true") {
      setIsAuthenticated(true);
      return;
    }
    
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5328/auth/user", {
          method: "GET",
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Authentication failed");
        }
        
        const data = await response.json();
        if (!data.authenticated) {
          toast.error("Please log in first.");
          router.push("/login");
          return;
        }
        
        // Store username if not already stored
        if (data.user && data.user.username) {
          localStorage.setItem("username", data.user.username);
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast.error("Authentication check failed");
        router.push("/login");
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in first");
      router.push("/login");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const username = localStorage.getItem("username");
    if (!username) {
      toast.error("User not found. Please log in again.");
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("config", config);
      formData.append("username", username);

      // First upload and convert to NIfTI
      const uploadResponse = await fetch("http://localhost:5328/inference/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        if (uploadResponse.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error(errorData.error || "Upload failed");
      }

      const uploadData = await uploadResponse.json();
      if (!uploadData.success) throw new Error(uploadData.error);

      // Then run inference
      const inferenceResponse = await fetch("http://localhost:5328/inference/run", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          job_id: uploadData.job_id,
          config: uploadData.config
        }),
      });

      if (!inferenceResponse.ok) {
        const errorData = await inferenceResponse.json();
        if (inferenceResponse.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error(errorData.error || "Inference failed");
      }

      // Handle result download
      const blob = await inferenceResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `segmentation_result_${Date.now()}.nii.gz`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.success("Processing completed! Downloading results...");
      setSelectedFile(null);

    } catch (error: any) {
      console.error("Processing error:", error);
      toast.error(error.message || "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while checking authentication
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <DashboardNav />
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">New Medical Scan Upload</h2>
          
          <div className="space-y-6">
            {/* Configuration Selection */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">
                Scan Configuration
              </label>
              <select
                value={config}
                onChange={(e) => setConfig(e.target.value as "2d" | "3d_fullres")}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2d">2D Slice Collection</option>
                <option value="3d_fullres">3D Volume (High Resolution)</option>
              </select>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">
                Upload Scan Data
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-blue-500">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-gray-600">
                    {selectedFile ? selectedFile.name : "Click to select ZIP file"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Supported format: .zip containing PNG slices
                  </span>
                </label>
              </div>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Processing your scan...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isProcessing}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Start Analysis"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}