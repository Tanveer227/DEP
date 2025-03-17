"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import DashboardNav from "@/components/DashboardNav";

export default function NewUploadPage() {
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gray-200">
      <DashboardNav />
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">New Upload</h2>
        <div className="bg-white shadow rounded p-4">
          <div className="mb-4">
            <label className="block text-gray-800 font-medium mb-2">
              Select File Type:
            </label>
            <select className="w-full p-2 border border-gray-300 rounded">
              <option value="2d-zip">2D Zip</option>
              <option value="3d-zip">3D Zip</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Upload File:
            </label>
            <input
              type="file"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
