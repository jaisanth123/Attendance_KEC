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
    yearOfStudy: "II",
    branch: "AIDS",
    section: "B",
  });

  const fetchStudentsWithLeaveCount = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${backendURL}/api/students/leaves`,
        {
          params: filters,
        }
      );
      setStudentsData(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch students data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsWithLeaveCount();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStudentsWithLeaveCount();
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
      <div className="px-4 py-6 mx-4 mt-4 mb-10 w-auto max-w-4xl text-white rounded-2xl sm:mx-6 md:mx-auto bg-slate-800">
        <div className="mx-auto w-full">
          <h1 className="mb-8 text-2xl font-bold text-center md:text-3xl">
            ON DUTY
          </h1>

          <form onSubmit={handleSubmit} className="w-full">
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
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="branch"
                  className="block mb-2 text-base md:text-lg"
                >
                  Branch:
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={filters.branch}
                  onChange={handleInputChange}
                  className="p-2 w-full text-gray-800 bg-white rounded-md border-0 md:p-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AIDS">AI & DS</option>
                  <option value="AIML">AI & ML</option>
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="section"
                  className="block mb-2 text-base md:text-lg"
                >
                  Section:
                </label>
                <select
                  id="section"
                  name="section"
                  value={filters.section}
                  onChange={handleInputChange}
                  className="p-2 w-full text-gray-800 bg-white rounded-md border-0 md:p-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>

            <div className="mb-6 w-full">
              <label
                htmlFor="date"
                className="block mb-2 text-base text-center md:text-lg"
              >
                Select Date:
              </label>
              <div className="flex items-center mx-auto max-w-md">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={filters.date}
                  onChange={handleInputChange}
                  className="p-2 w-full text-gray-800 bg-white rounded-md border-0 md:p-3 focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="ml-2 text-white" size={24} />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="flex justify-center items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md shadow transition duration-200 md:px-6 md:py-3 md:text-base hover:bg-blue-700"
              >
                <Filter className="mr-2" size={18} />
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Content section */}
      <div className="p-6 mx-auto max-w-7xl">
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-12 h-12 rounded-full border-t-4 border-b-4 border-blue-600 animate-spin"></div>
          </div>
        ) : error ? (
          <div
            className="relative px-4 py-3 mb-6 text-red-700 bg-red-100 rounded-lg border border-red-400"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Attendance for {new Date(filters.date).toLocaleDateString()}
              </h2>
              <div className="px-4 py-2 text-sm text-gray-600 bg-white rounded-lg shadow">
                Total:{" "}
                <span className="font-semibold">{studentsData.length}</span>{" "}
                students
              </div>
            </div>

            {studentsData.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">
                No students with leave count found for the selected filters.
              </div>
            ) : (
              <div className="space-y-8">
                {/* High risk students */}
                {highRiskStudents.length > 0 && (
                  <div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {highRiskStudents.map((student, index) => (
                        <div
                          key={index}
                          className="p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="mb-1 text-lg font-semibold text-gray-800">
                            {student.name}
                          </div>
                          <div className="mb-2 text-sm text-gray-600">
                            {student.rollNo}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Leave Count:
                            </span>
                            <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
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
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {mediumRiskStudents.map((student, index) => (
                        <div
                          key={index}
                          className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="mb-1 text-lg font-semibold text-gray-800">
                            {student.name}
                          </div>
                          <div className="mb-2 text-sm text-gray-600">
                            {student.rollNo}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Leave Count:
                            </span>
                            <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
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
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {lowRiskStudents.map((student, index) => (
                        <div
                          key={index}
                          className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="mb-1 text-lg font-semibold text-gray-800">
                            {student.name}
                          </div>
                          <div className="mb-2 text-sm text-gray-600">
                            {student.rollNo}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Leave Count:
                            </span>
                            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
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


