"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import DashboardNav from "@/components/DashboardNav";

export default function YourUploadPage() {
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const router = useRouter();
  const folders = ["Dataset1.zip", "Dataset2.zip", "Dataset3.zip"];

  useEffect(() => {
    const skipAuth = localStorage.getItem("skipAuth");

    if (skipAuth === "true") {
      // Optionally, you can remove the flag once used
      // localStorage.removeItem("skipAuth");
      return; // Skip the authentication check
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

  const toggleFolder = (folder: string) => {
    setSelectedFolders((prev) =>
      prev.includes(folder)
        ? prev.filter((f) => f !== folder)
        : [...prev, folder]
    );
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <DashboardNav />
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Your Uploads</h2>
        <div className="bg-white shadow rounded p-4">
          <ul>
            {folders.map((folder) => (
              <li
                key={folder}
                className="flex items-center py-2 border-b border-gray-200"
              >
                <input
                  type="checkbox"
                  checked={selectedFolders.includes(folder)}
                  onChange={() => toggleFolder(folder)}
                  className="mr-2"
                />
                <span className="text-gray-800">{folder}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end space-x-4">
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Discard
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Send to CVAT
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Show Corrected Files
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
