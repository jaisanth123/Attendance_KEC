import React, { useState } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Users,
  Info,
  X,
  FileCheck,
  AlertTriangle,
} from "lucide-react";

function UploadCsv() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [uploadStats, setUploadStats] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [validationErrors, setValidationErrors] = useState(null);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setMessage("");
      setUploadStats(null);
    } else if (selectedFile) {
      setMessage("Please select a valid CSV file.");
      setMessageType("error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setMessage("");
      setUploadStats(null);
    } else if (droppedFile) {
      setMessage("Please drop a valid CSV file.");
      setMessageType("error");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = () => {
    setFile(null);
    setMessage("");
    setUploadStats(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setMessage("");
    setUploadStats(null);

    const formData = new FormData();
    formData.append("csvfile", file);

    try {
      const res = await fetch(`${backendURL}/api/upload/add-student`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setMessage(data.message || "");
      setMessageType(data.success ? "success" : "error");
      setUploadStats(data.stats || null);
      setShowSummary(true);
      setValidationErrors(data.validationErrors || null);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Upload failed. Please check your file and try again.");
      setMessageType("error");
      setUploadStats(null);
      setValidationErrors(null);
      setShowSummary(true);
    } finally {
      setIsUploading(false);
      // Don't clear file on success, let user see the result
      if (messageType === "error") {
        setFile(null);
      }
    }
  };

  const handleDownloadMockData = () => {
    // Create comprehensive mock CSV data
    const mockData = `rollNo,name,hostellerDayScholar,gender,yearOfStudy,branch,section,parentMobileNo,studentMobileNo,superPacc
21PA1A0501,John Doe,HOSTELLER,MALE,II,CSE,A,9876543210,9123456780,YES
21PA1A0502,Jane Smith,DAY SCHOLAR,FEMALE,II,CSE,A,9876543211,9123456781,NO
21PA1A0503,Bob Johnson,HOSTELLER,MALE,II,CSE,A,9876543212,9123456782,YES
21PA1A0504,Alice Brown,DAY SCHOLAR,FEMALE,II,CSE,A,9876543213,9123456783,NO
21PA1A0505,Charlie Wilson,HOSTELLER,MALE,II,CSE,B,9876543214,9123456784,YES
21PA1A0506,Diana Lee,DAY SCHOLAR,FEMALE,II,CSE,B,9876543215,9123456785,NO
21PA1A0507,Frank Miller,HOSTELLER,MALE,II,CSE,B,9876543216,9123456786,YES
21PA1A0508,Grace Davis,DAY SCHOLAR,FEMALE,II,CSE,B,9876543217,9123456787,NO
21PA1A0509,Henry Taylor,HOSTELLER,MALE,II,CSE,C,9876543218,9123456788,YES
21PA1A0510,Ivy Chen,DAY SCHOLAR,FEMALE,II,CSE,C,9876543219,9123456789,NO
22PA1A0501,Jack Anderson,HOSTELLER,MALE,III,CSE,A,9876543220,9123456790,YES
22PA1A0502,Kate Martinez,DAY SCHOLAR,FEMALE,III,CSE,A,9876543221,9123456791,NO
22PA1A0503,Liam Thompson,HOSTELLER,MALE,III,CSE,A,9876543222,9123456792,YES
22PA1A0504,Maya Rodriguez,DAY SCHOLAR,FEMALE,III,CSE,B,9876543223,9123456793,NO
22PA1A0505,Noah Garcia,HOSTELLER,MALE,III,CSE,B,9876543224,9123456794,YES
23PA1A0501,Olivia White,DAY SCHOLAR,FEMALE,IV,CSE,A,9876543225,9123456795,NO
23PA1A0502,Peter Harris,HOSTELLER,MALE,IV,CSE,A,9876543226,9123456796,YES
23PA1A0503,Quinn Clark,DAY SCHOLAR,FEMALE,IV,CSE,B,9876543227,9123456797,NO
23PA1A0504,Ryan Lewis,HOSTELLER,MALE,IV,CSE,B,9876543228,9123456798,YES
23PA1A0505,Sophia Walker,DAY SCHOLAR,FEMALE,IV,CSE,C,9876543229,9123456799,NO`;

    // Create blob and download
    const blob = new Blob([mockData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_student_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 mx-auto space-y-6 max-w-4xl">
      {/* Header Section */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Upload Student Data
        </h2>
        <p className="text-gray-600">
          Upload CSV file containing student information for bulk import
        </p>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
            dragActive
              ? "bg-blue-50 border-blue-400"
              : file
              ? "bg-green-50 border-green-400"
              : "bg-gray-50 border-gray-300 hover:border-gray-400 hover:bg-gray-100"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <label className="flex flex-col justify-center items-center w-full h-48 cursor-pointer">
            <div className="flex flex-col justify-center items-center pt-5 pb-6">
              {file ? (
                <FileCheck className="mb-4 w-12 h-12 text-green-500" />
              ) : (
                <Upload className="mb-4 w-12 h-12 text-gray-400" />
              )}

              <p className="mb-2 text-lg font-medium text-gray-900">
                {file ? "File Selected" : "Upload CSV File"}
              </p>

              <p className="text-sm text-center text-gray-500">
                {file ? (
                  <span className="font-medium text-green-600">
                    {file.name}
                  </span>
                ) : (
                  <>
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </>
                )}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                CSV files only, max 5MB
              </p>
            </div>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 p-1 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
              !file || isUploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {isUploading ? (
              <>
                <div className="mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 w-4 h-4" />
                Upload Students
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMockData}
            className="flex justify-center items-center px-6 py-3 font-medium text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
          >
            <Download className="mr-2 w-4 h-4" />
            Download Sample
          </button>
        </div>
      </div>

      {/* Upload Stats */}
      {false && uploadStats && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center mb-3 space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-green-900">Upload Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {uploadStats.total}
              </div>
              <div className="text-green-700">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {uploadStats.inserted}
              </div>
              <div className="text-blue-700">New Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {uploadStats.duplicates}
              </div>
              <div className="text-yellow-700">Duplicates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {uploadStats.errors}
              </div>
              <div className="text-red-700">Errors</div>
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      {false && message && (
        <div
          className={`p-4 rounded-lg flex items-start space-x-3 ${
            messageType === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">
              {messageType === "success" ? "Success!" : "Error"}
            </p>
            <p className="mt-1 text-sm">{message}</p>
          </div>
        </div>
      )}
      {/* Modal: Upload Summary */}
      {showSummary && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 mx-4 w-full max-w-2xl bg-white rounded-xl shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                {messageType === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Summary
                </h3>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <p
                className={`mb-4 text-sm ${
                  messageType === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {message}
              </p>
            )}

            {uploadStats && (
              <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-4">
                <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {uploadStats.total}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="p-4 text-center bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {uploadStats.inserted}
                  </div>
                  <div className="text-sm text-green-700">Inserted</div>
                </div>
                <div className="p-4 text-center bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">
                    {uploadStats.duplicates}
                  </div>
                  <div className="text-sm text-yellow-700">Duplicates</div>
                </div>
                <div className="p-4 text-center bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">
                    {uploadStats.errors}
                  </div>
                  <div className="text-sm text-red-700">Errors</div>
                </div>
              </div>
            )}

            {validationErrors &&
              Array.isArray(validationErrors) &&
              validationErrors.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 font-medium text-gray-800">
                    Validation Issues
                  </div>
                  <div className="overflow-y-auto max-h-60 rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 font-medium text-left text-gray-600">
                            Row
                          </th>
                          <th className="px-3 py-2 font-medium text-left text-gray-600">
                            Roll No
                          </th>
                          <th className="px-3 py-2 font-medium text-left text-gray-600">
                            Errors
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationErrors.map((v, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-3 py-2 text-gray-700">{v.row}</td>
                            <td className="px-3 py-2 text-gray-700">
                              {v.rollNo}
                            </td>
                            <td className="px-3 py-2 text-gray-700">
                              <ul className="ml-5 space-y-1 list-disc">
                                {v.errors.map((e, i) => (
                                  <li key={i}>{e}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowSummary(false);
                  setFile(null);
                  setMessage("");
                  setMessageType("");
                  setUploadStats(null);
                  setValidationErrors(null);
                }}
                className="px-4 py-2 text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadCsv;
