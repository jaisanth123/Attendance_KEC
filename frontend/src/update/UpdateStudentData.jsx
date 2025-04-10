import { useState, useEffect } from "react";
import { Search, User, Save, X, ChevronDown, Edit, Loader } from "lucide-react";

export default function UpdateStudentData() {
  const [searchType, setSearchType] = useState("rollNo");
  const [searchTerm, setSearchTerm] = useState("");
  const [nameSearchResults, setNameSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showNameDropdown, setShowNameDropdown] = useState(false);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Function to search students by name for suggestions
  const searchStudentsByName = async (name) => {
    if (!name.trim()) {
      setNameSearchResults([]);
      setShowNameDropdown(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/students/search?name=${encodeURIComponent(
          name
        )}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setNameSearchResults(data.data);
        setShowNameDropdown(true);
      } else {
        setNameSearchResults([]);
        setShowNameDropdown(false);
      }
    } catch (error) {
      console.error("Error searching by name:", error);
      setNameSearchResults([]);
      setShowNameDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch student details by roll number
  const fetchStudentByRollNo = async (rollNo) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/students/${encodeURIComponent(rollNo)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setSelectedStudent(data.data);
        // Initialize updatedData with the current student data
        setUpdatedData(data.data);
        setMessage({ text: "", type: "" });
      } else {
        setSelectedStudent(null);
        setMessage({
          text: "Student not found with the provided roll number",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      setSelectedStudent(null);
      setMessage({
        text: "Failed to fetch student data",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setMessage({ text: "Please enter a search term", type: "warning" });
      return;
    }

    if (searchType === "rollNo") {
      fetchStudentByRollNo(searchTerm);
    } else {
      searchStudentsByName(searchTerm);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchType === "name") {
      // Debounce implementation for name search
      const debounceTimeout = setTimeout(() => {
        searchStudentsByName(value);
      }, 300);

      return () => clearTimeout(debounceTimeout);
    }
  };

  // Handle selecting a student from name search results
  const handleSelectStudent = (student) => {
    setSearchTerm(student.name);
    setSelectedStudent(student);
    setUpdatedData(student);
    setShowNameDropdown(false);
    setNameSearchResults([]);
  };

  // Handle input change in the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission to update student data
  const handleUpdateStudent = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/students/update-student-data/${encodeURIComponent(
          selectedStudent.rollNo
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSelectedStudent(data.data);
        setEditMode(false);
        setMessage({
          text: "Student data updated successfully",
          type: "success",
        });
      } else {
        setMessage({
          text: data.message || "Failed to update student data",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error updating student data:", error);
      setMessage({
        text: "Error connecting to the server",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing and revert changes
  const handleCancelEdit = () => {
    setUpdatedData(selectedStudent);
    setEditMode(false);
  };

  return (
    <div className="p-6 mx-auto w-full max-w-4xl bg-white rounded-lg shadow-md">
      <h1 className="flex items-center mb-6 text-2xl font-bold text-gray-800">
        <User className="mr-2" />
        Student Management
      </h1>

      {/* Search Type Toggle */}
      <div className="flex items-center mb-6">
        <span className="mr-3 text-gray-700">Search by:</span>
        <button
          type="button"
          onClick={() => {
            setSearchType("rollNo");
            setSearchTerm("");
            setNameSearchResults([]);
            setShowNameDropdown(false);
          }}
          className={`px-4 py-2 rounded-l-lg border ${
            searchType === "rollNo"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          Roll No
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchType("name");
            setSearchTerm("");
            setNameSearchResults([]);
            setShowNameDropdown(false);
          }}
          className={`px-4 py-2 rounded-r-lg border ${
            searchType === "name"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          Name
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchInputChange}
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

            {/* Name search dropdown */}
            {searchType === "name" &&
              showNameDropdown &&
              nameSearchResults.length > 0 && (
                <div className="overflow-y-auto absolute z-10 mt-1 w-full max-h-56 bg-white rounded-lg border border-gray-300 shadow-lg">
                  {nameSearchResults.map((student, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSelectStudent(student)}
                    >
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">
                          {student.rollNo}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.branch}, {student.section}
                      </div>
                    </div>
                  ))}
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

      {/* Status Messages */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : message.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-yellow-50 text-yellow-800 border-yellow-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Student Profile/Edit Form */}
      {selectedStudent && (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {editMode ? "Edit Student Information" : "Student Profile"}
            </h2>
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Edit className="mr-2 w-4 h-4" />
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                <X className="mr-2 w-4 h-4" />
                Cancel
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateStudent}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Roll Number (read-only) */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={updatedData.rollNo || ""}
                    disabled
                    className="p-3 w-full bg-gray-100 rounded-lg border border-gray-300"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={updatedData.name || ""}
                    onChange={handleInputChange}
                    className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Hosteller/Day Scholar */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Student Type
                  </label>
                  <select
                    name="hostellerDayScholar"
                    value={updatedData.hostellerDayScholar || ""}
                    onChange={handleInputChange}
                    className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Hosteller">Hosteller</option>
                    <option value="Day Scholar">Day Scholar</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={updatedData.gender || ""}
                    onChange={handleInputChange}
                    className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Year of Study */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Year of Study
                  </label>
                  <select
                    name="yearOfStudy"
                    value={updatedData.yearOfStudy || ""}
                    onChange={handleInputChange}
                    className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Branch
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={updatedData.branch || ""}
                    onChange={handleInputChange}
                    className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={updatedData.section || ""}
                    onChange={handleInputChange}
                    className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Parent Mobile */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Parent Mobile Number
                  </label>
                  <input
                    type="text"
                    name="parentMobileNo"
                    value={updatedData.parentMobileNo || ""}
                    onChange={handleInputChange}
                    className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Student Mobile */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Student Mobile Number
                  </label>
                  <input
                    type="text"
                    name="studentMobileNo"
                    value={updatedData.studentMobileNo || ""}
                    onChange={handleInputChange}
                    className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Super PACC */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Super PACC
                  </label>
                  <select
                    name="superPacc"
                    value={updatedData.superPacc || ""}
                    onChange={handleInputChange}
                    className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {isLoading ? (
                    <Loader className="mr-2 w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="mr-2 w-5 h-5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Roll Number
                </div>
                <div className="font-semibold">{selectedStudent.rollNo}</div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Name
                </div>
                <div className="font-semibold">{selectedStudent.name}</div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Student Type
                </div>
                <div className="font-semibold">
                  {selectedStudent.hostellerDayScholar}
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Gender
                </div>
                <div className="font-semibold">{selectedStudent.gender}</div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Year of Study
                </div>
                <div className="font-semibold">
                  {selectedStudent.yearOfStudy}
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Branch
                </div>
                <div className="font-semibold">{selectedStudent.branch}</div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Section
                </div>
                <div className="font-semibold">{selectedStudent.section}</div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Parent Mobile Number
                </div>
                <div className="font-semibold">
                  {selectedStudent.parentMobileNo}
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Student Mobile Number
                </div>
                <div className="font-semibold">
                  {selectedStudent.studentMobileNo}
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-1 text-sm font-medium text-gray-500">
                  Super PACC
                </div>
                <div className="font-semibold">{selectedStudent.superPacc}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
