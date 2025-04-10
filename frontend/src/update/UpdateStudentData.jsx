
// export default UpdateStudentData;
import { useState, useEffect } from "react";
import { Search, Loader } from "lucide-react";

export default function UpdateStudentData() {
  const [searchType, setSearchType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchTypeChange = () => {
    setSearchType(searchType === "name" ? "rollNo" : "name");
    setSearchTerm("");
    setStudents([]);
    setMessage("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setMessage("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      let url;
      if (searchType === "name") {
        url = `http://localhost:5000/api/students/search?name=${encodeURIComponent(
          searchTerm.toUpperCase()
        )}`;
      } else {
        url = `http://localhost:5000/api/students/${encodeURIComponent(
          searchTerm.toUpperCase()
        )}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      if (searchType === "name") {
        setStudents(data.data || []);
        if (data.data.length === 0) {
          setMessage("No students found matching the search term");
        }
      } else {
        // For roll number search, we get a single student object
        if (data.success) {
          setStudents([data.data]);
        } else {
          setMessage("Student not found with the provided roll number");
        }
      }
    } catch (error) {
      setMessage(error.message || "Failed to fetch student data");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto w-full max-w-4xl bg-white rounded-lg shadow-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Student Search</h1>

      {/* Search Type Toggle */}
      <div className="flex items-center mb-6">
        <span className="mr-3 text-gray-700">Search by:</span>
        <div
          className="inline-block relative w-16 h-8 bg-gray-200 rounded-full border cursor-pointer"
          onClick={handleSearchTypeChange}
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-blue-600 transition-transform duration-200 ease-in-out ${
              searchType === "rollNo" ? "left-9" : "left-1"
            }`}
          ></div>
        </div>
        <span className="ml-3 font-medium text-gray-700">
          {searchType === "name" ? "Name" : "Roll No"}
        </span>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Enter student ${
                searchType === "name" ? "name" : "roll number"
              }...`}
              className="px-4 py-3 pr-12 w-full rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isLoading && (
              <div className="absolute top-3 right-3">
                <Loader className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Search className="mr-2 w-5 h-5" />
            Search
          </button>
        </div>
      </form>

      {/* Message Display */}
      {message && (
        <div className="p-4 mb-6 text-yellow-800 bg-yellow-50 rounded-lg border border-yellow-200">
          {message}
        </div>
      )}

      {/* Results Display */}
      {students.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                  Roll No
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                  Name
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                  Year
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                  Branch
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                  Section
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.rollNo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.yearOfStudy}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.branch}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.section}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
