"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type Tab = "history" | "new-upload" | "your-upload" | "corrected";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const router = useRouter();

  useEffect(() => {
    const skipAuth = localStorage.getItem("skipAuth");

    if (skipAuth === "true") {
      // Optionally, you can remove the flag once used
      // localStorage.removeItem("skipAuth");
      return; // Skip the authentication check
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5328/auth/user', {
          method: 'GET',
          credentials: 'include', // Important for sending cookies
        });

        const data = await response.json();

        if (!data.authenticated) {
          toast.error('Please log in first.');
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('Error checking authentication.');
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Navigation Bar */}
      <nav className="bg-black shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4">
            <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tab="history" label="History" />
            <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tab="new-upload" label="New Upload" />
            <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tab="your-upload" label="Your Upload" />
            <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tab="corrected" label="Corrected" />
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto p-6">
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "new-upload" && <NewUploadTab />}
        {activeTab === "your-upload" && <YourUploadTab />}
        {activeTab === "corrected" && <CorrectedTab />}
      </main>
    </div>
  );
}

type TabButtonProps = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  tab: Tab;
  label: string;
};

function TabButton({ activeTab, setActiveTab, tab, label }: TabButtonProps) {
  const isActive = activeTab === tab;
  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-lg font-medium ${isActive
        ? "text-blue-400 border-b-2 border-blue-400"
        : "text-white-600 hover:text-blue-200"
        }`}
    >
      {label}
    </button>
  );
}

/* ---------------- History Tab ---------------- */
// Contains logs of the model that the user has trained till date.
function HistoryTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-black">Model Training History</h2>
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
    </div>
  );
}

/* ---------------- New Upload Tab ---------------- */
// Contains a dropdown for file type (2D zip, 3D zip) and a file input placeholder.
function NewUploadTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4  text-black">New Upload</h2>
      <div className="bg-white shadow rounded p-4">
        <div className="mb-4">
          <label className="block text-gray-800 font-medium mb-2">Select File Type:</label>
          <select className="w-full p-2 border border-gray-300 rounded">
            <option value="2d-zip">2D Zip</option>
            <option value="3d-zip">3D Zip</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-800 font-medium mb-2">Upload File:</label>
          <input type="file" className="w-full p-2 border border-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Your Upload Tab ---------------- */
// Displays folders with checkboxes. Users can select multiple folders/files.
// At the bottom there are three buttons: Discard, Send to CVAT, and I HAVE CORRECTED.
function YourUploadTab() {
  const folders = ["Dataset1.zip", "Dataset2.zip", "Dataset3.zip"];
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  const toggleFolder = (folder: string) => {
    setSelectedFolders((prev) =>
      prev.includes(folder)
        ? prev.filter((f) => f !== folder)
        : [...prev, folder]
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4  text-black">Your Uploads</h2>
      <div className="bg-white shadow rounded p-4">
        <ul>
          {folders.map((folder) => (
            <li key={folder} className="flex items-center py-2 border-b border-gray-200">
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
    </div>
  );
}

/* ---------------- Corrected Tab ---------------- */
// Contains a copy of all files that have been sent to correction to CVAT.
// Displayed as folders (with the name "selected file copy") with two buttons at the bottom: TRAIN and DISCARD.
function CorrectedTab() {
  const correctedFolders = ["SelectedFileCopy1.zip", "SelectedFileCopy2.zip"];
  const [selectedCorrected, setSelectedCorrected] = useState<string[]>([]);

  const toggleCorrected = (folder: string) => {
    setSelectedCorrected((prev) =>
      prev.includes(folder)
        ? prev.filter((f) => f !== folder)
        : [...prev, folder]
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4  text-black">Corrected Uploads</h2>
      <div className="bg-white shadow rounded p-4">
        <ul>
          {correctedFolders.map((folder) => (
            <li key={folder} className="flex items-center py-2 border-b border-gray-200">
              <input
                type="checkbox"
                checked={selectedCorrected.includes(folder)}
                onChange={() => toggleCorrected(folder)}
                className="mr-2"
              />
              <span className="text-gray-800">{folder}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end space-x-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Train
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
