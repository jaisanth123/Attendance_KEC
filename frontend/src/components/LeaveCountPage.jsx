// LeaveCountPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";

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
        "http://localhost:5000/api/students/leaves",
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

  // Function to determine color based on leaveCount
  const getLeaveCountColor = (count) => {
    if (count >= 4) return "bg-red-100 text-red-800 border-red-300"; // High risk
    if (count >= 2) return "bg-yellow-100 text-yellow-800 border-yellow-300"; // Medium risk
    return "bg-green-100 text-green-800 border-green-300"; // Low risk
  };

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <h1 className="mb-6 text-2xl font-bold">Student Leave Count</h1>

      <form
        onSubmit={handleSubmit}
        className="p-6 mb-8 bg-white rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="date"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={filters.date}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="yearOfStudy"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Year of Study
            </label>
            <select
              id="yearOfStudy"
              name="yearOfStudy"
              value={filters.yearOfStudy}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="branch"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Branch
            </label>
            <select
              id="branch"
              name="branch"
              value={filters.branch}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="AIDS">AIDS</option>
              <option value="AIML">AI & ML</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="section"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Section
            </label>
            <select
              id="section"
              name="section"
              value={filters.section}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin"></div>
        </div>
      ) : error ? (
        <div
          className="relative px-4 py-3 text-red-700 bg-red-100 rounded border border-red-400"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Students with Leave Count
                {filters.date &&
                  ` for ${new Date(filters.date).toLocaleDateString()}`}
              </h2>
              <div className="text-sm text-gray-600">
                Total:{" "}
                <span className="font-semibold">{studentsData.length}</span>{" "}
                students
              </div>
            </div>

            {studentsData.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No students with leave count found for the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Roll Number
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Leave Count
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentsData.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {student.rollNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getLeaveCountColor(
                              student.leaveCount
                            )}`}
                          >
                            {student.leaveCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {student.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaveCountPage;
