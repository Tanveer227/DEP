"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import DashboardNav from "@/components/DashboardNav";

export default function DashboardPage() {
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
        <h2 className="text-2xl font-bold mb-4 text-black">
          Model Training History
        </h2>
        <div className="bg-white shadow rounded p-4 text-black">
          {/* Example logs */}
          <div className="py-2 border-b border-gray-200">
            <p className="font-semibold">Model #1</p>
            <p>Trained on 2023-05-21, Accuracy: 95%</p>
          </div>
          <div className="py-2 border-b border-gray-200">
            <p className="font-semibold">Model #2</p>
            <p>Trained on 2023-06-01, Accuracy: 90%</p>
          </div>
          <div className="py-2 border-b border-gray-200">
            <p className="font-semibold">Model #3</p>
            <p>Trained on 2023-07-05, Accuracy: 92%</p>
          </div>
        </div>
      </main>
    </div>
  );
}
