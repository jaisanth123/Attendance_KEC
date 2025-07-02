import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ClassInfo = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(true);
  const [error, setError] = useState("");

  const authToken = sessionStorage.getItem("authToken");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  });

  if (!authToken) {
    toast.error("Authorization token is missing. Please log in again.", {
      autoClose: 800,
    });
    return null;
  }

  // Fetch distinct classes from backend
  const fetchDistinctClasses = async () => {
    setClassesLoading(true);
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(
        `${backendURL}/api/students/distinct-classes`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.data.success) {
        setCourses(response.data.classes);
        console.log("Fetched distinct classes:", response.data.classes);
      } else {
        setError("Failed to fetch class information");
      }
    } catch (err) {
      console.error("Error fetching distinct classes:", err);
      setError("Error fetching class information");
      toast.error("Failed to load class information", { autoClose: 800 });
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchAttendanceData = async (course, date) => {
    setLoading(true);
    setError("");

    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(
        `${backendURL}/api/attendance/getAttendanceStatusCount`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            yearOfStudy: course.yearOfStudy,
            branch: course.branch,
            section: course.section,
            date,
          },
        }
      );
      return response.data;
    } catch (err) {
      setError(
        `Error fetching attendance data: ${
          err.response?.data?.message || err.message
        }`
      );
      console.error("API Error: ", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (courses.length === 0) {
      setError("Class information is not loaded yet. Please wait.");
      return;
    }

    setAttendanceData([]);
    setLoading(true);

    try {
      const allAttendanceData = await Promise.all(
        courses.map((course) => fetchAttendanceData(course, date))
      );
      setAttendanceData(allAttendanceData.filter((data) => data !== null));
    } catch (err) {
      setError("Error fetching attendance data for some classes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (selectedDate) => {
    setLoading(true);
    setError("");
    setAttendanceData([]);
    try {
      const allAttendanceData = await Promise.all(
        courses.map((course) => fetchAttendanceData(course, selectedDate))
      );
      setAttendanceData(allAttendanceData.filter((data) => data !== null));
    } catch (err) {
      setError("Error fetching attendance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistinctClasses();
  }, []);

  // Fetch attendance data when courses are loaded
  useEffect(() => {
    if (courses.length > 0) {
      fetchData(date);
    }
  }, [courses]);

  const navigate = useNavigate();

  const totalAbsentCount = attendanceData.reduce(
    (sum, item) => sum + (parseInt(item.absentCount, 10) || 0),
    0
  );

  const totalOtherStatusCount = attendanceData.reduce(
    (sum, item) => sum + (parseInt(item.otherStatusCount, 10) || 0),
    0
  );

  return (
    <div className="container p-4 mx-auto">
      <div className="flex justify-center items-center">
        <div className="p-6 w-full max-w-sm text-white bg-gray-800 rounded-md shadow-lg">
          <form onSubmit={handleSubmit}>
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-center">
                Class Attendance Information
              </h2>
              <label
                htmlFor="date"
                className="block mb-2 text-lg font-medium text-gray-200"
              >
                Select Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block px-4 py-3 mt-1 w-full text-white bg-gray-700 rounded-md border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                required
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 mt-4 w-full text-white bg-blue-500 rounded-md duration-500 hover:scale-110 hover:bg-blue-600"
              disabled={loading || classesLoading}
            >
              {classesLoading
                ? "Loading Classes..."
                : loading
                ? "Loading..."
                : "Fetch Attendance Data"}
            </button>
            <button
              onClick={() => navigate("/homePage")}
              className="px-4 py-2 mt-4 w-full font-bold text-white bg-gray-600 rounded-md shadow transition duration-500 hover:scale-105 hover:bg-gray-700"
            >
              Back
            </button>
          </form>

          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </div>
      </div>

      {attendanceData.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xl text-white uppercase bg-gray-800">
              <tr>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3">Absent Count</th>
                <th className="px-6 py-3">Other Status Count</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((attendance, index) => (
                <tr key={index} className="text-lg bg-white border-b">
                  <td
                    className={`px-6 py-4 ${
                      attendance.absentCount === "N/A"
                        ? "text-red-500 font-bold"
                        : ""
                    }`}
                  >
                    {attendance.classs}
                  </td>
                  <td className="px-6 py-4">{attendance.absentCount}</td>
                  <td className="px-6 py-4">{attendance.otherStatusCount}</td>
                </tr>
              ))}
              <tr className="text-xl font-bold text-white bg-gray-800">
                <td className="px-6 py-4">Total</td>
                <td className="px-6 py-4">{totalAbsentCount}</td>
                <td className="px-6 py-4">{totalOtherStatusCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClassInfo;
