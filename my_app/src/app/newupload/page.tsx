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

      const inferenceResponse = await fetch("http://localhost:5328/inference/run", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          job_id: uploadData.job_id,
          config: uploadData.config,
          inference_dir: uploadData.inference_dir  // Pass the inference directory
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

      toast.success("Processing completed! Redirecting to results...");
      router.push("/predictions");
    } catch (error: any) {
      console.error("Processing error:", error);
      toast.error(error.message || "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 text-gray-900">
      <DashboardNav />
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">New Medical Scan Upload</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-700">Scan Configuration</label>
              <select
                value={config}
                onChange={(e) => setConfig(e.target.value as "2d" | "3d_fullres")}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="2d">2D Slice Collection</option>
                <option value="3d_fullres">3D Volume (High Resolution)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-700">Upload Scan Data</label>
              <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-3">
                  <span className="text-gray-700 font-medium">{selectedFile ? selectedFile.name : "Click to select ZIP file"}</span>
                  <span className="text-sm text-gray-500">Supported format: .zip containing PNG slices</span>
                </label>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isProcessing}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Start Analysis"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}