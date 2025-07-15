import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const backendURL = import.meta.env.VITE_BACKEND_URL;

function InfoStatusPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // States for filters
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [yearOfStudy, setYearOfStudy] = useState("nan");
  const [section, setSection] = useState("nan");

  // States for data
  const [absentStudents, setAbsentStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [infoStatusLogs, setInfoStatusLogs] = useState([]);
  const [initialStates, setInitialStates] = useState({});

  useEffect(() => {
    if (yearOfStudy !== "nan" && section !== "nan" && date) {
      fetchAbsentStudents(yearOfStudy, section, date);
    } else {
      setAbsentStudents([]);
    }
  }, [yearOfStudy, section, date]);

  const fetchAbsentStudents = async (yearOfStudy, section, selectedDate) => {
    try {
      const response = await axios.get(
        `${backendURL}/api/attendance/absent-students-info`,
        {
          params: {
            yearOfStudy,
            branch: "CSE",
            section,
            date: selectedDate,
          },
        }
      );

      const { students, message } = response.data;

      if (!students || students.length === 0) {
        setMessage(
          message ||
            `No absent students found for ${yearOfStudy} - CSE - ${section}`
        );
        setAbsentStudents([]);
        return;
      }

      setMessage("");
      setAbsentStudents(students);

      // Set initial states
      const states = {};
      students.forEach((student) => {
        states[student.rollNo] = student.infoStatus;
      });
      setInitialStates(states);
    } catch (error) {
      console.error("Error fetching absent students:", error);
      toast.error("Error fetching absent students. Please try again.");
      setAbsentStudents([]);
    }
  };

  const toggleStatus = (index) => {
    const updatedStudents = [...absentStudents];
    const student = updatedStudents[index];
    const previousStatus = student.infoStatus;
    const newStatus =
      previousStatus === "NotInformed" ? "Informed" : "NotInformed";

    updatedStudents[index].infoStatus = newStatus;
    setAbsentStudents(updatedStudents);

    // Add to logs
    const existingLogIndex = infoStatusLogs.findIndex(
      (log) => log.rollNo === student.rollNo
    );

    if (existingLogIndex !== -1) {
      const updatedLogs = [...infoStatusLogs];
      updatedLogs[existingLogIndex] = {
        rollNo: student.rollNo,
        name: student.name,
        initialStatus: initialStates[student.rollNo],
        newStatus: newStatus,
      };
      setInfoStatusLogs(updatedLogs);
    } else {
      const newLog = {
        rollNo: student.rollNo,
        name: student.name,
        initialStatus: initialStates[student.rollNo],
        newStatus: newStatus,
      };
      setInfoStatusLogs((prevLogs) => [newLog, ...prevLogs]);
    }
  };

  const handleUpdateInfoStatus = async () => {
    setIsUpdating(true);
    try {
      // Prepare the updates array with changed students only
      const updates = infoStatusLogs.map((log) => ({
        rollNo: log.rollNo,
        infoStatus: log.newStatus,
      }));

      // Send bulk update request
      const response = await axios.post(
        `${backendURL}/api/attendance/bulk-update-info-status`,
        {
          updates,
          date,
        }
      );

      toast.success(
        `Successfully updated ${response.data.updated.length} students' information status`
      );

      // If there were errors, show them
      if (response.data.errors && response.data.errors.length > 0) {
        toast.warning(
          `${response.data.errors.length} updates failed. Check console for details.`
        );
        console.error("Update errors:", response.data.errors);
      }

      setInfoStatusLogs([]);
      await fetchAbsentStudents(yearOfStudy, section, date);
      setIsConfirmed(false);
    } catch (error) {
      console.error("Error updating info status:", error);
      toast.error("Failed to update information status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="p-4 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg sm:p-6">
        <h1 className="text-2xl font-semibold text-center text-white sm:text-3xl md:text-4xl">
          Update Information Status
        </h1>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 gap-4 mt-4 w-full sm:grid-cols-2 md:grid-cols-3">
          <Dropdown
            label="Year"
            value={yearOfStudy}
            options={["IV", "III", "II"]}
            onChange={(e) => setYearOfStudy(e.target.value)}
          />
          <Dropdown
            label="Section"
            value={section}
            options={["A", "B", "C"]}
            onChange={(e) => setSection(e.target.value)}
          />
          <div className="w-full">
            <label
              htmlFor="date"
              className="block mb-2 text-sm font-medium text-white sm:text-base md:text-lg"
            >
              Date:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="px-3 py-2 w-full text-sm text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600 sm:px-4 sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-row gap-2 justify-center my-4 sm:gap-4 sm:my-6">
        <button className="px-3 py-2 text-xs text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-sm md:px-6 md:py-3 md:text-base">
          Informed
        </button>
        <button className="px-3 py-2 text-xs text-white bg-red-600 rounded-lg shadow hover:bg-red-700 sm:px-4 sm:py-2 sm:text-sm md:px-6 md:py-3 md:text-base">
          Not Informed
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className="p-3 mt-4 w-full max-w-lg text-sm text-center text-red-500 sm:p-4 sm:mt-6 sm:text-base md:text-lg">
          {message}
        </div>
      )}

      {/* Students Grid */}
      {absentStudents.length > 0 && (
        <div className="grid grid-cols-1 gap-3 mt-4 w-full sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {absentStudents.map((student, index) => (
            <div
              key={index}
              onClick={() => toggleStatus(index)}
              className={`flex flex-col items-center justify-center py-3 px-2 text-white transition-all transform duration-500 rounded-lg cursor-pointer shadow-md sm:py-4 ${
                student.infoStatus === "Informed"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-red-600 hover:bg-red-700"
              } hover:scale-110`}
            >
              <div className="text-sm font-semibold sm:text-base md:text-lg lg:text-xl">
                {student.name}
              </div>
              <div className="mt-1 text-xs font-medium text-center sm:text-sm">
                {student.rollNo}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Status Logs */}
      {infoStatusLogs.length > 0 && (
        <div className="p-4 mt-6 w-full max-w-3xl rounded-lg shadow-lg sm:p-6 sm:mt-8">
          <h2 className="text-lg font-bold text-center sm:text-xl md:text-2xl">
            Information Status Change Logs
          </h2>
          <div className="mt-3 sm:mt-4">
            {infoStatusLogs.map((log, index) => (
              <div
                key={index}
                className="flex flex-col justify-between mb-2 text-sm font-semibold sm:flex-row sm:mb-3 sm:text-base"
              >
                <span>
                  {log.rollNo} - {log.name}
                </span>
                <span>
                  {log.initialStatus} → {log.newStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {absentStudents.length > 0 && (
        <button
          onClick={() => setIsConfirmed(true)}
          disabled={isUpdating || infoStatusLogs.length === 0}
          className={`w-full px-4 py-3 mt-4 h-16 text-lg text-white transition-all duration-500 sm:px-6 sm:py-3 sm:mt-6 sm:h-20 sm:text-xl md:text-2xl ${
            isUpdating || infoStatusLogs.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-600 hover:scale-110"
          } rounded-lg sm:w-1/2 md:w-1/3 lg:w-1/4`}
        >
          {isUpdating ? "Updating Status..." : "Update Status"}
        </button>
      )}

      <button
        onClick={() => navigate("/homePage")}
        className="px-4 py-3 mt-3 w-full h-16 text-lg text-white bg-gray-800 rounded-lg transition-all duration-500 transform hover:bg-gray-600 hover:scale-110 sm:px-6 sm:py-3 sm:mt-5 sm:h-20 sm:text-xl md:text-2xl sm:w-1/2 md:w-1/3 lg:w-1/4"
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
              Confirm Update Information Status
            </h2>
            <p className="mt-4 text-lg text-center text-gray-300">
              {infoStatusLogs.length} students' information status will be
              updated.
            </p>
            <div className="flex justify-between mt-6">
              <button
                onClick={handleUpdateInfoStatus}
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

function Dropdown({ label, value, options, onChange }) {
  return (
    <div className="w-full">
      <label
        htmlFor={label}
        className="block mb-2 text-sm text-white sm:text-base md:text-lg"
      >
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="px-3 py-2 w-full text-sm text-white bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring focus:ring-gray-600 sm:px-4 sm:text-base"
      >
        <option value="nan">Select {label}</option>
        {options.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default InfoStatusPage;
