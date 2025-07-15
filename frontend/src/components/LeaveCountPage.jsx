import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Filter } from "lucide-react";
const backendURL = import.meta.env.VITE_BACKEND_URL;

const LeaveCountPage = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    yearOfStudy: "",
    section: "",
  });

  const fetchStudentsWithLeaveCount = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendURL}/api/students/leaves`, {
        params: {
          ...filters,
          branch: "CSE",
        },
      });
      setStudentsData(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch students data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.yearOfStudy && filters.section) {
      fetchStudentsWithLeaveCount();
    } else {
      setStudentsData([]);
    }
  }, [filters.yearOfStudy, filters.section, filters.date]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Group students by leave count for visual separation
  const highRiskStudents = studentsData.filter(
    (student) => student.leaveCount >= 4
  );
  const mediumRiskStudents = studentsData.filter(
    (student) => student.leaveCount >= 2 && student.leaveCount < 4
  );
  const lowRiskStudents = studentsData.filter(
    (student) => student.leaveCount < 2
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section */}
      <div className="px-4 py-6 mx-4 mt-4 mb-10 w-auto max-w-4xl text-white rounded-2xl sm:mx-6 md:mx-auto lg:mx-auto xl:mx-auto bg-slate-800">
        <div className="mx-auto w-full">
          <h1 className="mb-8 text-xl font-bold text-center sm:text-2xl md:text-3xl lg:text-4xl">
            LEAVE COUNT
          </h1>

          <div className="w-full">
            <div className="grid grid-cols-1 gap-4 mb-6 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
              <div className="w-full">
                <label
                  htmlFor="yearOfStudy"
                  className="block mb-2 text-base md:text-lg"
                >
                  Year:
                </label>
                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={filters.yearOfStudy}
                  onChange={handleInputChange}
                  className="p-2 w-full text-gray-800 bg-white rounded-md border-0 md:p-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Year</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="section"
                  className="block mb-2 text-base md:text-lg"
                >
                  Class:
                </label>
                <select
                  id="section"
                  name="section"
                  value={filters.section}
                  onChange={handleInputChange}
                  className="p-2 w-full text-gray-800 bg-white rounded-md border-0 md:p-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Class</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="date"
                  className="block mb-2 text-base md:text-lg"
                >
                  Date:
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={filters.date}
                  onChange={handleInputChange}
                  className="p-2 w-full text-sm text-gray-800 bg-white rounded-md border-0 sm:text-base md:p-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content section */}
      <div className="p-4 mx-auto max-w-7xl sm:p-6">
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-8 h-8 rounded-full border-t-4 border-b-4 border-blue-600 animate-spin sm:w-12 sm:h-12"></div>
          </div>
        ) : error ? (
          <div
            className="relative px-3 py-2 mb-4 text-red-700 bg-red-100 rounded-lg border border-red-400 sm:px-4 sm:py-3 sm:mb-6"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div>
            <div className="flex flex-col justify-between items-start mb-4 sm:flex-row sm:items-center sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
                Attendance for {new Date(filters.date).toLocaleDateString()}
              </h2>
              <div className="px-3 py-1 mt-2 text-xs text-gray-600 bg-white rounded-lg shadow sm:px-4 sm:py-2 sm:text-sm sm:mt-0">
                Total:{" "}
                <span className="font-semibold">{studentsData.length}</span>{" "}
                students
              </div>
            </div>

            {studentsData.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow sm:p-6">
                No students with leave count found for the selected filters.
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* High risk students */}
                {highRiskStudents.length > 0 && (
                  <div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {highRiskStudents.map((student, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 rounded-lg border border-red-200 shadow-sm transition-shadow hover:shadow-md sm:p-4"
                        >
                          <div className="mb-1 text-sm font-semibold text-gray-800 sm:text-lg">
                            {student.name}
                          </div>
                          <div className="mb-2 text-xs text-gray-600 sm:text-sm">
                            {student.rollNo}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Leave Count:
                            </span>
                            <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full sm:px-3 sm:text-sm">
                              {student.leaveCount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medium risk students */}
                {mediumRiskStudents.length > 0 && (
                  <div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {mediumRiskStudents.map((student, index) => (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm transition-shadow hover:shadow-md sm:p-4"
                        >
                          <div className="mb-1 text-sm font-semibold text-gray-800 sm:text-lg">
                            {student.name}
                          </div>
                          <div className="mb-2 text-xs text-gray-600 sm:text-sm">
                            {student.rollNo}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Leave Count:
                            </span>
                            <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full sm:px-3 sm:text-sm">
                              {student.leaveCount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Low risk students */}
                {lowRiskStudents.length > 0 && (
                  <div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {lowRiskStudents.map((student, index) => (
                        <div
                          key={index}
                          className="p-3 bg-green-50 rounded-lg border border-green-200 shadow-sm transition-shadow hover:shadow-md sm:p-4"
                        >
                          <div className="mb-1 text-sm font-semibold text-gray-800 sm:text-lg">
                            {student.name}
                          </div>
                          <div className="mb-2 text-xs text-gray-600 sm:text-sm">
                            {student.rollNo}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Leave Count:
                            </span>
                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full sm:px-3 sm:text-sm">
                              {student.leaveCount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveCountPage;
