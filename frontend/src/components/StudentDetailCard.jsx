import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { Loader, AlertTriangle } from "lucide-react";

const StudentDetailCard = ({ student, isOpen, onClose }) => {
  const [fullStudentData, setFullStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // Fetch complete student data when card opens
  useEffect(() => {
    if (isOpen && student && student.rollNo) {
      fetchCompleteStudentData(student.rollNo);
    }
  }, [isOpen, student]);

  const fetchCompleteStudentData = async (rollNo) => {
    try {
      setLoading(true);
      setError("");
      const upperCase = rollNo.toUpperCase();
      const response = await fetch(
        `${backendURL}/api/students/search/${encodeURIComponent(upperCase)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setFullStudentData(data.data);
      } else {
        setError("Failed to fetch complete student data");
        setFullStudentData(null);
      }
    } catch (err) {
      console.error("Error fetching complete student data:", err);
      setError("Error loading student information");
      setFullStudentData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFullStudentData(null);
    setError("");
    onClose();
  };

  if (!isOpen || !student) return null;

  const displayData = fullStudentData || student;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white rounded-xl border border-gray-200 shadow-2xl transition-all duration-500 transform animate-slideDown max-h-[85vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-t-xl border-b border-gray-200 sm:p-4">
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
            Student Details
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 text-gray-400 rounded-full transition-colors duration-200 hover:bg-gray-200 hover:text-gray-600"
          >
            <IoClose className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-8">
              <Loader className="mb-3 w-6 h-6 text-red-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading details...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col justify-center items-center py-8">
              <AlertTriangle className="mb-3 w-6 h-6 text-red-500" />
              <p className="mb-3 text-sm text-center text-red-600">{error}</p>
              <button
                onClick={() => fetchCompleteStudentData(student.rollNo)}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Student Information */}
          {!loading && !error && (
            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Roll Number:
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {displayData.rollNo || "Not specified"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {displayData.name || "Not specified"}
                </span>
              </div>

              {/* Year, Branch, Section in same line */}
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Class:
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {displayData.yearOfStudy || "N/A"} -{" "}
                  {displayData.branch || "N/A"} - {displayData.section || "N/A"}
                </span>
              </div>

              {fullStudentData && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Gender:
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {fullStudentData.gender || "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Student Type:
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {fullStudentData.hostellerDayScholar || "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Student Mobile:
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {fullStudentData.studentMobileNo || "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Parent Mobile:
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {fullStudentData.parentMobileNo || "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Super PACC:
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {fullStudentData.superPacc || "Not specified"}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="py-2 w-full text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailCard;
