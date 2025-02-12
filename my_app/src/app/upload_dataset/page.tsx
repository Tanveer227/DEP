"use client";
import React, { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [taskNumber, setTaskNumber] = useState<number | null>(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a file first");
      return;
    }
    if (!taskNumber || taskNumber <= 0) {
      setStatus("Please enter a valid task number");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskNumber", taskNumber.toString());

    setStatus("Uploading...");
    try {
      const res = await fetch("/api/uploadZip", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        setStatus("Upload successful: " + json.fileName);
      } else {
        setStatus("Upload failed: " + json.error);
      }
    } catch (error) {
      console.error("Upload error", error);
      setStatus("Upload error");
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Upload Medical Image Archive</h1>
      <p className="description">
        Upload ZIP files containing PNG or NIfTI images. Maximum file size: 500MB per ZIP.
      </p>
      <form className="upload-box" onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Enter Task Number"
          onChange={(e) => setTaskNumber(Number(e.target.value))}
        />
        <input
          type="file"
          accept=".zip"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setFile(e.target.files[0]);
            }
          }}
        />
        <button type="submit" className="upload-button">
          Upload
        </button>
      </form>
      {status && <p className="status">{status}</p>}
    </div>
  );
}
