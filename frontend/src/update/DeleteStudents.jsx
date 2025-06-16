import React, { useState } from "react";
import { Trash2, Users, User, AlertCircle, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DeleteStudents() {
  const navigate = useNavigate();
  const [isBulkMode, setIsBulkMode] = useState(true);
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const apiBase = "http://localhost:5000";

  const handleBulkDelete = async () => {
    if (!yearOfStudy || !branch || !section) {
      setMessage({
        text: "All fields are required for bulk delete.",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/delete-students/students`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearOfStudy, branch, section }),
      });
      const text = await res.text();
      setMessage({ text, type: "success" });
      // Clear form
      setYearOfStudy("");
      setBranch("");
      setSection("");
    } catch (err) {
      setMessage({ text: "Bulk delete failed.", type: "error" });
    }
  };

  const handleSingleDelete = async () => {
    if (!rollNo) {
      setMessage({
        text: "Roll No is required for single delete.",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(
        `${apiBase}/api/delete-students/student/${rollNo}`,
        {
          method: "DELETE",
        }
      );
      const text = await res.text();
      setMessage({ text, type: "success" });
      // Clear form
      setRollNo("");
    } catch (err) {
      setMessage({ text: "Single delete failed.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate("/update-data")}
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Database size={16} />
              <span>Update Data</span>
            </button>
            <button
              onClick={() => navigate("/delete-student")}
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-800 text-white shadow-sm"
            >
              <Trash2 size={16} />
              <span>Delete Students</span>
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="px-6 py-6 mb-8 text-white shadow-lg rounded-xl bg-slate-800">
          <h1 className="flex items-center text-3xl font-bold">
            <Trash2 className="mr-3" size={30} />
            Delete Students
          </h1>
          <p className="mt-2 text-slate-300">
            Remove individual students or bulk delete by class
          </p>
        </div>

        {/* Main Content */}
        <div className="overflow-hidden bg-white shadow-md rounded-xl">
          {/* Toggle Controls */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="font-medium text-gray-700">Delete Mode:</span>
              <div className="flex overflow-hidden border border-gray-300 rounded-md">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkMode(true);
                    setMessage({ text: "", type: "" });
                  }}
                  className={`px-4 py-2 ${
                    isBulkMode
                      ? "bg-slate-800 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Users className="inline-block w-4 h-4 mr-2" />
                  Bulk Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkMode(false);
                    setMessage({ text: "", type: "" });
                  }}
                  className={`px-4 py-2 ${
                    !isBulkMode
                      ? "bg-slate-800 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <User className="inline-block w-4 h-4 mr-2" />
                  Single Delete
                </button>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {message.text && (
            <div
              className={`mx-6 my-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>{message.text}</p>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="p-6">
            {isBulkMode ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Year of Study
                    </label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="">Select Year</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="">Select Branch</option>
                      <option value="AIDS">AI & DS</option>
                      <option value="AIML">AI & ML</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Section
                    </label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleBulkDelete}
                    disabled={!yearOfStudy || !branch || !section}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      !yearOfStudy || !branch || !section
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <Trash2 className="inline-block w-4 h-4 mr-2" />
                    Delete Students
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                    placeholder="Enter Roll Number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSingleDelete}
                    disabled={!rollNo}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      !rollNo
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <Trash2 className="inline-block w-4 h-4 mr-2" />
                    Delete Student
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteStudents;
