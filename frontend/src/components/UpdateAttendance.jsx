import React, { useState, useEffect } from "react";
import axios from "axios";

import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const backendURL = import.meta.env.VITE_BACKEND_URL;

function UpdateAttendance() {
  const [yearOfStudy, setYearOfStudy] = useState("nan");
  const [branch, setBranch] = useState("nan");
  const [section, setSection] = useState("nan");
  const location = useLocation();
  const navigate = useNavigate();
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  ); // Set default to current date
  const [rollNumbers, setRollNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // New state for updating attendance
  const [attendanceLogs, setAttendanceLogs] = useState([]); // New state for attendance change logs
  const [initialStates, setInitialStates] = useState([]);

  const authToken = sessionStorage.getItem("authToken");

  if (!authToken) {
    toast.error("Authorization token is missing. Please log in again.", {
      autoClose: 800,
    });

    setIsLoading(false);
    return;
  }
  const fetchStudentData = async () => {
    if (
      yearOfStudy === "nan" ||
      branch === "nan" ||
      section === "nan" ||
      !date
    ) {
      return;
    }
    setIsLoading(true);

    console.log("Fetching data with:", {
      yearOfStudy: yearOfStudy,
      class: branch,
      section: section,
      date,
    });
    try {
      setRollNumbers([]);
      const response = await axios.get(
        `${backendURL}/api/attendance/get-attendancestatus`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Add the token to the header
          },
          params: {
            yearOfStudy,
            branch,
            section,
            date,
          },
        }
      );

      const { attendanceStates } = response.data;
      setRollNumbers(
        attendanceStates.map((student) => ({
          rollNo: student.rollNo,
          name: student.name, // Assuming student name is part of the response
          state: student.state,
        }))
      );
      setInitialStates(
        attendanceStates.reduce((acc, student) => {
          acc[student.rollNo] = student.state;
          return acc;
        }, {})
      );
    } catch (error) {
      console.error("Error fetching student data:", error);
      if (error.response && error.response.status === 404) {
        toast.info("Attendance has not been marked yet for this date.", {
          autoClose: 800,
        });
      } else {
        toast.error("Failed to fetch student data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [yearOfStudy, branch, section, date]); // Trigger fetch on field change

  const handleClosePopup = () => {
    setIsConfirmed(false);
  };

  const updateAttendanceStatus = async () => {
    handleClosePopup();
    setIsUpdating(true); // Set isUpdating to true when starting the update process

    try {
      const rollNumberStateMapping = rollNumbers.reduce((acc, student) => {
        acc[student.rollNo] = student.state;
        return acc;
      }, {});

      const response = await axios.post(
        `${backendURL}/api/attendance/mark-updatestatus`,
        {
          yearOfStudy,
          branch,
          section,
          date,
          rollNumberStateMapping,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Add the token to the header
          },
        }
      );
      toast.success(
        response.data.message || "Attendance updated successfully!",
        {
          autoClose: 800,
        }
      );
      setIsConfirmed(false);
      await fetchStudentData();

      // Reset attendance logs after update
      setAttendanceLogs([]); // Reset logs after successful update
    } catch (error) {
      console.error("Error updating attendance status:", error);
      toast.error("Failed to update attendance status.");
    } finally {
      setIsUpdating(false); // Reset isUpdating after the process is done
    }
  };

  const [changedStudents, setChangedStudents] = useState([]); // Track students who have changed their attendance
  const navigateToHome = () => {
    // Close the card before navigating
    navigate("/homePage"); // Navigate to home page
  };

  const toggleState = (index) => {
    const updatedRollNumbers = [...rollNumbers];

    const currentState = updatedRollNumbers[index].state;
    const previousState = currentState;

    const newState =
      currentState === "Present"
        ? "On Duty"
        : currentState === "On Duty"
        ? "SuperPacc"
        : currentState === "SuperPacc"
        ? "Absent"
        : "Present"; // Default to "Present" if it's "Absent"

    updatedRollNumbers[index].state = newState;
    setRollNumbers(updatedRollNumbers);

    // Add log entry for the state change
    const { rollNo, name } = updatedRollNumbers[index];

    const initialState = initialStates[rollNo];
    // Check if a log already exists for this student and update it
    const existingLogIndex = attendanceLogs.findIndex(
      (log) => log.rollNo === rollNo
    );

    if (existingLogIndex !== -1) {
      // Update the existing log if the student already has a log entry
      const updatedLogs = [...attendanceLogs];
      updatedLogs[existingLogIndex] = {
        rollNo,
        name,
        initialState,
        newState,
      };
      setAttendanceLogs(updatedLogs);
    } else {
      // Add a new log if no log exists for the student
      const newLog = {
        rollNo,
        name,
        initialState,
        newState,
      };
      setAttendanceLogs((prevLogs) => [newLog, ...prevLogs]);
    }
  };

  return (
    <>
      {/* Full Screen Loading Animation */}
      {isUpdating && (
        <div className="flex fixed inset-0 z-50 flex-col justify-center items-center bg-black bg-opacity-80 backdrop-blur-md">
          <div className="flex flex-col items-center space-y-6">
            {/* Spinner */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-t-4 border-gray-300 animate-spin border-t-blue-500"></div>
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-4 border-transparent animate-spin border-t-green-400 animation-delay-150"></div>
            </div>

            {/* Loading Text */}
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                Updating Attendance
              </h2>
              <p className="text-lg text-gray-300 animate-pulse">
                Please wait while we update the attendance records...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-2 bg-gray-700 rounded-full md:w-80">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 items-center p-6 md:p-8 lg:p-12">
        <div className="p-6 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-center text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Update Attendance
          </h1>

          {/* Dropdowns */}
          <div className="flex flex-col gap-4 justify-center mt-4 w-full sm:flex-row">
            <Dropdown
              label="Year"
              value={yearOfStudy}
              options={["IV", "III", "II"]}
              onChange={(e) => {
                setYearOfStudy(e.target.value);
                fetchStudentData();
              }}
            />
            <Dropdown
              label="Section"
              value={section}
              options={["A", "B", "C"]}
              onChange={(e) => {
                setSection(e.target.value);
                fetchStudentData();
              }}
            />
            <Dropdown
              label="Branch"
              value={branch}
              options={["AIDS", "AIML"]}
              onChange={(e) => {
                fetchStudentData();
                setBranch(e.target.value);
              }}
            />
          </div>

          {/* Date Selection */}
          <div className="flex justify-center items-center pb-5 mt-8">
            <div className="w-full max-w-sm">
              <label
                htmlFor="date"
                className="block mb-2 text-lg font-medium text-center text-white"
              >
                Date:
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  fetchStudentData();
                }}
                max={new Date().toISOString().split("T")[0]} // Restrict future dates
                className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-center my-6 sm:gap-4">
          <button className="px-3 py-2 text-sm text-white bg-amber-600 rounded-lg shadow transition-all duration-200 sm:px-6 sm:py-3 sm:text-base hover:bg-amber-700">
            SuperPacc
          </button>
          <button className="px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow transition-all duration-200 sm:px-6 sm:py-3 sm:text-base hover:bg-red-700">
            Absent
          </button>
          <button className="px-3 py-2 text-sm text-white bg-green-900 rounded-lg shadow transition-all duration-200 sm:px-6 sm:py-3 sm:text-base hover:bg-green-800">
            Present
          </button>
          <button className="px-3 py-2 text-sm text-white bg-sky-700 rounded-lg shadow transition-all duration-200 sm:px-6 sm:py-3 sm:text-base hover:bg-sky-600">
            On Duty
          </button>
        </div>

        {/* Roll Numbers */}
        {rollNumbers.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-6 w-full sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
            {rollNumbers.map((rollNumber, index) => (
              <div
                key={index}
                onClick={() => toggleState(index)}
                className={`flex items-center justify-center p-6 text-white transition-all transform duration-500 text-xl font-semibold rounded-lg cursor-pointer shadow-md ${
                  rollNumber.state === "SuperPacc"
                    ? "bg-amber-600  rounded-lg shadow   hover:scale-110"
                    : rollNumber.state === "Absent"
                    ? "bg-red-600 rounded-lg shadow   hover:scale-110"
                    : rollNumber.state === "Present"
                    ? "bg-green-900 rounded-lg shadow  hover:scale-110 "
                    : "bg-sky-700  rounded-lg shadow  hover:scale-110"
                } hover:scale-110`}
              >
                {rollNumber.rollNo}
              </div>
            ))}
          </div>
        )}

        {/* Update Button */}

        {/* Attendance Logs */}
        {/* Attendance Logs */}
        {attendanceLogs.length > 0 && (
          <div className="p-6 mt-8 w-full max-w-3xl rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center">
              Attendance Change Logs
            </h2>
            <div className="mt-4">
              {attendanceLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex justify-between mb-3 font-semibold"
                >
                  <span>
                    {log.rollNo} - {log.name}
                  </span>
                  <span>
                    {log.initialState} → {log.newState}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {rollNumbers.length > 0 && (
          <button
            onClick={() => setIsConfirmed(true)}
            disabled={isUpdating} // Disable button when updating
            className={`w-full px-6 py-3 mt-6  h-20 text-white text-2xl transition-all duration-500 ${
              isUpdating ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800"
            } rounded-lg lg:w-1/4 md:w-1/5 sm:w-1/2 hover:scale-110 hover:bg-gray-600`}
          >
            {isUpdating ? "Updating Attendance..." : "Update Attendance"}{" "}
            {/* Update button text */}
          </button>
        )}

        <button
          onClick={navigateToHome}
          className="px-6 py-3 mt-5 w-full h-20 text-2xl text-white bg-gray-800 rounded-lg transition-all duration-500 transform hover:bg-gray-600 hover:scale-110 lg:w-1/4 md:w-1/5 sm:w-1/2"
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
                Confirm Update Attendance
              </h2>
              <p className="mt-4 text-lg text-center text-gray-300">
                {rollNumbers.length > 0
                  ? `Students' attendance will be updated as specified.`
                  : "No students to update."}
              </p>
              <div className="flex justify-between mt-6">
                <button
                  onClick={updateAttendanceStatus}
                  className="py-2 mr-3 w-1/2 font-medium text-white bg-green-500 rounded-lg shadow-md x-4 hover:bg-green-600 focus:ring-4 focus:ring-green-300"
                >
                  Confirm
                </button>
                <button
                  onClick={handleClosePopup}
                  className="px-4 py-2 w-1/2 font-medium text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 focus:ring-4 focus:ring-red-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Dropdown({ label, value, options, onChange }) {
  return (
    <div className="w-full max-w-[250px]">
      <label htmlFor={label} className="block mb-2 text-white">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="px-4 py-2 w-full text-white bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring focus:ring-gray-600"
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

export default UpdateAttendance;
