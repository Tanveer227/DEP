"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import DashboardNav from "@/components/DashboardNav";

export default function CorrectedPage() {
  const [correctedTasks, setCorrectedTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCorrectedTasks = async () => {
      try {
        const response = await fetch("http://localhost:5328/cvat/corrected-tasks", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && data.correctedTasks) {
          setCorrectedTasks(data.correctedTasks);
        } else {
          throw new Error(data.error || "Failed to fetch corrected tasks");
        }
      } catch (error) {
        console.error("Error fetching corrected tasks:", error);
        toast.error("Failed to load corrected tasks");
      }
    };
    fetchCorrectedTasks();
  }, []);

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const sendToDataset = async () => {
    if (selectedTasks.length === 0) {
      toast.error("No corrected tasks selected.");
      return;
    }
    try {
      const cvat_username = localStorage.getItem("cvat_username");
      const cvat_password = localStorage.getItem("cvat_password");
      if (!cvat_username || !cvat_password) {
        toast.error("CVAT credentials missing. Please log in again.");
        return;
      }
      const payload = {
        username: cvat_username,
        password: cvat_password,
        task_ids: selectedTasks,
      };
      const response = await fetch("http://localhost:5328/cvat/send-to-dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send tasks to dataset");
      }
      toast.success("Corrected tasks sent to dataset successfully.");
      setCorrectedTasks(correctedTasks.filter(task => !selectedTasks.includes(task.taskId)));
      setSelectedTasks([]);
    } catch (error) {
      console.error("Error sending tasks to dataset:", error);
      toast.error("Failed to send tasks to dataset.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <DashboardNav />
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Corrected Uploads</h2>
        <div className="bg-white shadow rounded p-4">
          {correctedTasks.length === 0 ? (
            <p className="text-center text-gray-600">No corrected tasks found.</p>
          ) : (
            <ul>
              {correctedTasks.map((task) => (
                <li key={task.taskId} className="flex items-center py-2 border-b border-gray-200">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedTasks.includes(task.taskId)}
                    onChange={() => toggleTaskSelection(task.taskId)}
                  />
                  <span className="text-gray-800">{task.displayName}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-end space-x-4">
            <button
              onClick={sendToDataset}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Send to Dataset
            </button>
            <button
              onClick={() => toast.info("Discard functionality is not implemented yet")}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Discard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
