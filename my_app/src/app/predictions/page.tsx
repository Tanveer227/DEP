"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import DashboardNav from "@/components/DashboardNav";

export default function YourUploadPage() {
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const skipAuth = localStorage.getItem("skipAuth");

    if (skipAuth === "true") {
      return; // Skip authentication check
    }
    
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5328/auth/user", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (!data.authenticated) {
          toast.error("Please log in first.");
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast.error("Error checking authentication.");
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch('http://localhost:5328/inference/temp_results', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch folders');
        }
        
        setFolders(data.folders || []);
      } catch (error) {
        console.error('Error fetching folders:', error);
        toast.error('Failed to load folders');
      }
    };

    fetchFolders();
  }, []);

  const toggleFolder = (folder: string) => {
    setSelectedFolders((prev) =>
      prev.includes(folder)
        ? prev.filter((f) => f !== folder)
        : [...prev, folder]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 flex flex-col">
      <DashboardNav />
      <main className="max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-6">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">Your Uploads</h2>
        <div className="bg-gray-50 shadow-lg rounded-lg p-6 border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {folders.map((folder) => (
              <li
                key={folder}
                className="flex items-center py-3 px-4 hover:bg-gray-100 rounded-lg transition"
              >
                <input
                  type="checkbox"
                  checked={selectedFolders.includes(folder)}
                  onChange={() => toggleFolder(folder)}
                  className="mr-3 w-5 h-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                />
                <span className="text-lg text-gray-700 font-medium">{folder}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-center space-x-4">
            <button className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md transform transition duration-200 hover:scale-105">
              Discard
            </button>
            <button className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md transform transition duration-200 hover:scale-105">
              Send to CVAT
            </button>
            <button className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transform transition duration-200 hover:scale-105">
              Show Corrected Files
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
