import React, { useState } from 'react';

function UploadCsv() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('csvfile', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload/add-student', {
        method: 'POST',
        body: formData,
      });
      const text = await res.text();
      setMessage(text);
    } catch (err) {
      setMessage('Upload failed.');
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6">
      <h1 className="text-2xl font-bold mb-4">CSV Upload</h1>

      <div
        className="w-80 h-40 border-2 border-dashed border-black flex items-center justify-center cursor-pointer mb-4"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <label className="text-center cursor-pointer">
          {file ? file.name : 'Drag & Drop CSV or Click to Select'}
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
        className={`px-4 py-2 rounded text-white ${
          !file || isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload CSV'}
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

export default UploadCsv;
