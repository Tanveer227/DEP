"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import DashboardNav from "@/components/DashboardNav";

type CorrectedTask = {
  task_id: string;
  task_name: string;
  displayName: string;
};

const formatBratsName = (name: string): string => {
  // If it's already in la_XXX format, return as is
  if (name.startsWith('la_')) {
    return name;
  }
  
  // Extract numbers from the original name
  const numbers = name.match(/\d+/g);
  if (!numbers || numbers.length === 0) return name;
  
  // Format as BRATS_XXX where XXX is patient number with leading zeros
  return `BRATS_${numbers[0].padStart(3, '0')}`;
};

export default function CorrectedPage() {
  const router = useRouter();
  const [correctedTasks, setCorrectedTasks] = useState<CorrectedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [resolution, setResolution] = useState<string>("3d_fullres");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [cvatUsername, setCvatUsername] = useState("");
  const [cvatPassword, setCvatPassword] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<string>("Dataset001_BrainTumour");

  useEffect(() => {
    fetchCorrectedTasks();
  }, []);

  const fetchCorrectedTasks = async () => {
    try {
      const response = await fetch("http://localhost:5328/cvat/corrected-tasks", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.correctedTasks) {
        // Use the displayName directly from the backend without additional formatting
        setCorrectedTasks(data.correctedTasks);
      } else {
        throw new Error(data.error || "Failed to fetch corrected tasks");
      }
    } catch (error) {
      console.error("Error fetching corrected tasks:", error);
      toast.error("Failed to load corrected tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleTrain = async () => {
    if (selectedTasks.length === 0) {
      toast.error("Please select at least one task to train on.");
      return;
    }

    setIsProcessing(true);
    try {
      // Use the displayName directly from the tasks
      const selectedTasksData = correctedTasks
        .filter(task => selectedTasks.includes(task.task_id))
        .map(task => ({
          task_id: task.task_id,
          formatted_name: task.displayName
        }));

      const response = await fetch("http://localhost:5328/train-nnunet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolution: resolution,
          dataset: selectedDataset,
          tasks: selectedTasksData
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start training");
      }

      toast.success("Training started successfully!");
      router.push("/training");
    } catch (error) {
      console.error("Error starting training:", error);
      toast.error("Failed to start training");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCVATCredentialsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedTasks.length === 0) {
      toast.error("Please select at least one task");
      return;
    }
    setIsProcessing(true);

    try {
      // Get selected tasks with their formatted names
      const selectedTasksData = correctedTasks
        .filter(task => selectedTasks.includes(task.task_id))
        .map(task => ({
          task_id: task.task_id,
          formatted_name: selectedDataset === "Dataset001_BrainTumour" 
            ? formatBratsName(task.displayName)
            : task.displayName
        }));

      const response = await fetch("http://localhost:5328/cvat/send-to-dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: cvatUsername,
          password: cvatPassword,
          task_ids: selectedTasks,
          dataset: selectedDataset,
          tasks: selectedTasksData
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send tasks to dataset");
      }

      toast.success("Successfully sent to dataset!");
      setShowCredentialsModal(false);
      setCvatUsername("");
      setCvatPassword("");
      fetchCorrectedTasks(); // Refresh the task list
    } catch (error) {
      console.error("Error sending to dataset:", error);
      toast.error("Failed to send to dataset");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300">
      <DashboardNav />
      
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Corrected Tasks</h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="2d">2D</option>
                  <option value="3d">3D</option>
                  <option value="3d_fullres">3D FullRes</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Dataset</label>
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Dataset001_BrainTumour">Brain Tumor Dataset</option>
                  <option value="Dataset002_Heart">Heart Dataset</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Section */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : correctedTasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No corrected tasks available</h3>
              <p className="mt-2 text-gray-500">Corrected tasks will appear here after annotation</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {correctedTasks.map((task) => (
                      <tr key={task.task_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.task_id)}
                            onChange={() => toggleTaskSelection(task.task_id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {task.task_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.displayName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col md:flex-row justify-end gap-4">
                <button
                  onClick={() => setShowCredentialsModal(true)}
                  disabled={selectedTasks.length === 0 || isProcessing}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  Send to Dataset
                </button>
                <button
                  onClick={handleTrain}
                  disabled={selectedTasks.length === 0 || isProcessing}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {isProcessing ? "Processing..." : "Train Model"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* CVAT Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">CVAT Credentials</h2>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCVATCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={cvatUsername}
                  onChange={(e) => setCvatUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={cvatPassword}
                  onChange={(e) => setCvatPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCredentialsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {isProcessing ? "Processing..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}