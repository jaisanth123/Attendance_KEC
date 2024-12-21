import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ClassInfo = () => {
  const [date, setDate] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const authToken = sessionStorage.getItem("authToken");

  // Check if the authToken is missing
  if (!authToken) {
    toast.error("Authorization token is missing. Please log in again.", {
      autoClose: 800,
    });
    return null;  // Return null if no token exists
  }

  // Hardcoded courses data

  const courses = [
    { yearOfStudy: "II", branch: "AIDS", section: "A" },
  //   { yearOfStudy: "II", branch: "AIDS", section: "B" },
  //   { yearOfStudy: "II", branch: "AIDS", section: "C" },
  //   { yearOfStudy: "II", branch: "AIML", section: "A" },
  //   { yearOfStudy: "II", branch: "AIML", section: "B" },
  //   { yearOfStudy: "III", branch: "AIDS", section: "A" },
  //   { yearOfStudy: "III", branch: "AIDS", section: "B" },
     { yearOfStudy: "III", branch: "AIML", section: "A" },
  //   { yearOfStudy: "III", branch: "AIML", section: "B" },
  //   { yearOfStudy: "IV", branch: "AIDS", section: "A" },
  //   { yearOfStudy: "IV", branch: "AIML", section: "A" },
  ];
  //Fetch attendance data for a specific course and date
  const fetchAttendanceData = async (course, date) => {
    setLoading(true);
    setError("");



    try {
      const response = await axios.get(
        `http://localhost:5000/api/attendance/getAttendanceStatusCount`,
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
        `Error fetching attendance data: ${err.response?.data?.message || err.message}`
      );
      console.error("API Error: ", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (date) {
      setAttendanceData([]);
      setLoading(true);

      // Fetch attendance data for all courses
      try {
        const allAttendanceData = await Promise.all(
          courses.map((course) => fetchAttendanceData(course, date))
        );
          console.log(allAttendanceData);
        // Filter out any null values from the response
        setAttendanceData(allAttendanceData.filter((data) => data !== null));
      } catch (err) {
        setError("Error fetching attendance data for some classes.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please select a date.");
    }
 
  };

  return (
    <div className="container p-4 mx-auto">
      <h2 className="mb-4 text-2xl font-semibold text-center">
        Class Attendance Information
      </h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded-md"
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Attendance Data"}
        </button>
      </form>

      {error && <p className="text-center text-red-500">{error}</p>}
    

      {attendanceData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3">Absent Count</th>
                <th className="px-6 py-3">Other Status Count</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((attendance, index) => (

                <tr key={index} className="bg-white border-b">
                  <td className="px-6 py-4">{attendance.classs}</td>
                  <td className="px-6 py-4">{attendance.absentCount}</td>
                  <td className="px-6 py-4">{attendance.otherStatusCount}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
};

export default ClassInfo;
