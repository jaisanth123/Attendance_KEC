import React, { useState } from "react";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

function UploadCsv() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(""); // Clear message when new file is selected
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setMessage(""); // Clear message when new file is dropped
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("csvfile", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload/add-student", {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      setMessage(text);
      setMessageType("success");
    } catch (err) {
      setMessage("Upload failed.");
      setMessageType("error");
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center justify-center w-full h-32 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-slate-400 bg-slate-50 group"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <label className="flex flex-col items-center justify-center w-full h-full transition-colors cursor-pointer group-hover:bg-slate-100">
          <Upload className="w-8 h-8 mb-2 text-slate-400 group-hover:text-slate-500" />
          <span className="text-sm text-slate-600">
            {file ? file.name : "Drag & Drop CSV or Click to Select"}
          </span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || isUploading}
        className={`mt-4 px-4 py-2 rounded-md text-sm text-white transition-colors ${
          !file || isUploading
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-slate-800 hover:bg-slate-700 shadow-sm"
        }`}
      >
        {isUploading ? "Uploading..." : "Upload CSV"}
      </button>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md flex items-center ${
            messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2" />
          )}
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
}

export default UploadCsv;
