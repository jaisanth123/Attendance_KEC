import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Database, AlertCircle, CheckCircle } from "lucide-react";
const backendURL = import.meta.env.VITE_BACKEND_URL;

function UpdateSuperpacc() {
  const navigate = useNavigate();
  const [yearOfStudy, setYearOfStudy] = useState("nan");
  const [branch, setBranch] = useState("nan");
  const [section, setSection] = useState("nan");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [changedStudents, setChangedStudents] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [initialStates, setInitialStates] = useState({});

  const authToken = sessionStorage.getItem("authToken");

  if (!authToken) {
    toast.error("Authorization token is missing. Please log in again.", {
      autoClose: 800,
    });
    return;
  }

  useEffect(() => {
    if (yearOfStudy !== "nan" && branch !== "nan" && section !== "nan") {
      fetchStudents();
    } else {
      setStudents([]);
      setChangedStudents([]);
    }
  }, [yearOfStudy, branch, section]);

  const fetchStudents = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get(
        `${backendURL}/api/students/superpacc/status`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            yearOfStudy,
            branch,
            section,
          },
        }
      );

      if (response.data.success) {
        setStudents(response.data.data);
        // Store initial states
        const initialStatesMap = response.data.data.reduce((acc, student) => {
          acc[student.rollNo] = student.superPacc;
          return acc;
        }, {});
        setInitialStates(initialStatesMap);
      } else {
        setErrorMessage(response.data.message || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      if (error.response && error.response.status === 404) {
        setErrorMessage("No students found for the selected criteria.");
      } else {
        setErrorMessage("Failed to fetch students. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSuperPacc = (student) => {
    const newStatus = student.superPacc === "YES" ? "NO" : "YES";

    // Update the student in the local state
    setStudents((prevStudents) =>
      prevStudents.map((s) =>
        s.rollNo === student.rollNo ? { ...s, superPacc: newStatus } : s
      )
    );

    // Get the initial state (or "NO" if null/undefined)
    const initialState = initialStates[student.rollNo] || "NO";

    // Only add to changed students if the new state is different from initial state
    if (newStatus !== initialState) {
      setChangedStudents((prev) => {
        const filtered = prev.filter((s) => s.rollNo !== student.rollNo);
        return [
          {
            rollNo: student.rollNo,
            name: student.name,
            initialState: initialState,
            newState: newStatus,
          },
          ...filtered,
        ];
      });
    } else {
      // If the new state matches initial state, remove from changed students
      setChangedStudents((prev) =>
        prev.filter((s) => s.rollNo !== student.rollNo)
      );
    }
  };

  const handleUpdateSuperPacc = async () => {
    if (changedStudents.length === 0) {
      toast.info("No changes to update");
      return;
    }

    setIsUpdating(true);
    try {
      // Create a mapping of roll numbers to their new SuperPacc status
      const rollNumberStateMapping = changedStudents.reduce((acc, student) => {
        acc[student.rollNo] = student.newState === "YES";
        return acc;
      }, {});

      const response = await axios.post(
        `${backendURL}/api/students/superpacc/batch-update`,
        {
          yearOfStudy,
          branch,
          section,
          rollNumberStateMapping,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "SuperPacc status updated successfully!"
        );
        // Refresh the student list
        await fetchStudents();
        // Clear the changed students list
        setChangedStudents([]);
      } else {
        toast.error(
          response.data.message || "Failed to update SuperPacc status"
        );
      }
    } catch (error) {
      console.error("Error updating SuperPacc status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update SuperPacc status"
      );
    } finally {
      setIsUpdating(false);
      setIsConfirmed(false);
    }
  };

  const StudentCard = ({ student }) => {
    // Handle null/undefined as "NO"
    const isSuperPacc = student.superPacc === "YES";

    return (
      <div
        onClick={() => toggleSuperPacc(student)}
        className={`flex flex-col items-center justify-between p-6 text-white rounded-lg cursor-pointer shadow-md transition-transform transform ${
          isSuperPacc ? "bg-green-600" : "bg-red-600"
        } hover:scale-105 h-20 overflow-hidden`}
      >
        <div className="text-xl font-bold">{student.rollNo}</div>
        <div className="w-full text-xs text-center truncate">
          {student.name}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 items-center p-6 md:p-8 lg:p-12">
      <div className="p-6 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-semibold text-center text-white">
          Update SuperPacc Status
        </h1>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap gap-x-4 gap-y-4 justify-center mt-4 w-full">
          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label
              htmlFor="yearOfStudy"
              className="block text-lg font-medium text-white"
            >
              Year:
            </label>
            <select
              id="yearOfStudy"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
            >
              <option value="nan">Year</option>
              <option value="IV">IV</option>
              <option value="III">III</option>
              <option value="II">II</option>
            </select>
          </div>

          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label
              htmlFor="branch"
              className="block text-lg font-medium text-white"
            >
              Branch:
            </label>
            <select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
            >
              <option value="nan">Branch</option>
              <option value="AIDS">AIDS</option>
              <option value="AIML">AIML</option>
            </select>
          </div>

          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label
              htmlFor="section"
              className="block text-lg font-medium text-white"
            >
              Section:
            </label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
            >
              <option value="nan">Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center my-6">
        <div className="flex gap-2 items-center">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-gray-800">SuperPacc</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-800">Not SuperPacc</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 mb-4 font-bold text-red-600 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-4 w-full">
          <div className="w-8 h-8 rounded-full border-4 border-gray-800 animate-spin border-t-transparent"></div>
        </div>
      )}

      {/* Students Grid */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-3 mt-6 w-full sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {students.map((student) => (
            <StudentCard key={student.rollNo} student={student} />
          ))}
        </div>
      )}

      {/* Changed Students Display */}
      {changedStudents.length > 0 && (
        <div className="p-6 mt-8 w-full max-w-3xl rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center">
            SuperPacc Change Logs
          </h2>
          <div className="mt-4">
            {changedStudents.map((student, index) => (
              <div
                key={index}
                className="flex justify-between mb-3 font-semibold"
              >
                <span>
                  {student.rollNo} - {student.name}
                </span>
                <span>
                  {student.initialState || "NO"} → {student.newState}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Button */}
      {changedStudents.length > 0 && (
        <button
          onClick={() => setIsConfirmed(true)}
          disabled={isUpdating}
          className={`w-full px-6 py-3 mt-6 h-20 text-white text-2xl transition-all duration-500 ${
            isUpdating ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800"
          } rounded-lg lg:w-1/4 md:w-1/5 sm:w-1/2 hover:scale-110 hover:bg-gray-600`}
        >
          {isUpdating ? "Updating..." : "Update SuperPacc"}
        </button>
      )}

      {/* Home Button */}
      <button
        onClick={() => navigate("/homePage")}
        className="px-8 py-4 mt-8 w-full text-xl font-semibold text-white bg-gray-600 rounded-md transition-all duration-500 transform hover:bg-gray-700 hover:scale-110 md:w-1/4 lg:w-1/5"
      >
        Home
      </button>

      {/* Confirmation Popup */}
      {isConfirmed && (
        <div className="flex fixed inset-0 justify-center items-center bg-black bg-opacity-70 backdrop-blur-md animate-fadeIn">
          <div className="relative p-8 w-full max-w-lg bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl border border-gray-600 shadow-lg">
            <div className="flex absolute -top-6 left-1/2 justify-center items-center w-16 h-16 bg-green-600 rounded-full shadow-md transform -translate-x-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-center text-white">
              Confirm Update SuperPacc
            </h2>
            <p className="mt-4 text-lg text-center text-gray-300">
              {changedStudents.length > 0
                ? `${changedStudents.length} students' SuperPacc status will be updated.`
                : "No changes to update."}
            </p>
            <div className="flex justify-between mt-6">
              <button
                onClick={handleUpdateSuperPacc}
                className="py-2 mr-3 w-1/2 font-medium text-white bg-green-500 rounded-lg shadow-md x-4 hover:bg-green-600 focus:ring-4 focus:ring-green-300"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsConfirmed(false)}
                className="px-4 py-2 w-1/2 font-medium text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 focus:ring-4 focus:ring-red-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateSuperpacc;
