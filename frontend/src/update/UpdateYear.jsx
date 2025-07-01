import React, { useState } from "react";
import { Calendar, Users, Database, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
const backendURL = import.meta.env.VITE_BACKEND_URL;

function UpdateYear() {
  const navigate = useNavigate();
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const apiBase = "http://localhost:5000";

  const handleUpdateYear = async () => {
    if (!fromYear || !toYear) {
      setMessage({
        text: "Both from and to years are required.",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(`${backendURL}/api/students/update-year`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromYear, toYear }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update year");
      }

      setMessage({
        text: data.message || "Year updated successfully",
        type: "success",
      });
      // Clear form
      setFromYear("");
      setToYear("");
    } catch (err) {
      setMessage({
        text: err.message || "Failed to update year. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Toggle */}
        <div className="flex justify-between items-center mb-6">
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
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Trash2 size={16} />
              <span>Delete Students</span>
            </button>
            <button
              onClick={() => navigate("/update-year")}
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-800 text-white shadow-sm"
            >
              <Calendar size={16} />
              <span>Update Year</span>
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="px-6 py-6 mb-8 text-white rounded-xl shadow-lg bg-slate-800">
          <h1 className="flex items-center text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
            <Calendar className="mr-2 sm:mr-3" size={24} />
            <span className="sm:hidden">Update Year</span>
            <span className="hidden sm:inline">Update Year</span>
          </h1>
        </div>

        {/* Main Content */}
        <div className="overflow-hidden bg-white rounded-xl shadow-md">
          {/* Form Section */}
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    From Year
                  </label>
                  <select
                    value={fromYear}
                    onChange={(e) => setFromYear(e.target.value)}
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                    To Year
                  </label>
                  <select
                    value={toYear}
                    onChange={(e) => setToYear(e.target.value)}
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Select Year</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
              </div>

              {/* Status Messages */}
              {message.text && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleUpdateYear}
                  disabled={!fromYear || !toYear}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    !fromYear || !toYear
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}
                >
                  <Calendar className="inline-block mr-2 w-4 h-4" />
                  Update Year
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateYear;
