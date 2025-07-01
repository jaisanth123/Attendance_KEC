import { useState, useEffect } from "react";
import {
  Search,
  User,
  Save,
  X,
  Edit,
  Loader,
  Trash2,
  AlertTriangle,
  Users,
  Database,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const backendURL = import.meta.env.VITE_BACKEND_URL;

export default function UpdateStudentData() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("rollNo");
  const [searchTerm, setSearchTerm] = useState("");
  const [nameSearchResults, setNameSearchResults] = useState([]);
  const [rollNoSearchResults, setRollNoSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showRollNoDropdown, setShowRollNoDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        `${backendURL}/api/students/search/name?name=${encodeURIComponent(
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

  // Function to search students by roll number for suggestions
  const searchStudentsByRollNo = async (rollNo) => {
    if (!rollNo.trim()) {
      setRollNoSearchResults([]);
      setShowRollNoDropdown(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${backendURL}/api/students/search/rollno?rollNo=${encodeURIComponent(
          rollNo
        )}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setRollNoSearchResults(data.data);
        setShowRollNoDropdown(true);
      } else {
        setRollNoSearchResults([]);
        setShowRollNoDropdown(false);
      }
    } catch (error) {
      console.error("Error searching by roll number:", error);
      setRollNoSearchResults([]);
      setShowRollNoDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch student details by roll number
  const fetchStudentByRollNo = async (rollNo) => {
    try {
      const upperCase = rollNo.toUpperCase();
      setIsLoading(true);
      const response = await fetch(
        `${backendURL}/api/students/search/${encodeURIComponent(upperCase)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setSelectedStudent(data.data);
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
    } else {
      // Debounce implementation for roll number search
      const debounceTimeout = setTimeout(() => {
        searchStudentsByRollNo(value);
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

  // Handle selecting a student from roll number search results
  const handleSelectRollNoStudent = (student) => {
    setSearchTerm(student.rollNo);
    setSelectedStudent(student);
    setUpdatedData(student);
    setShowRollNoDropdown(false);
    setRollNoSearchResults([]);
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
      const url = `${backendURL}/api/students/update-student-data/${encodeURIComponent(
        selectedStudent.rollNo
      )}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server responded with ${response.status}: ${errorText}`
        );
      }

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
        text: error.message || "Error connecting to the server",
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

  // Delete student function
  const deleteStudent = async () => {
    if (!selectedStudent || !selectedStudent.rollNo) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(
        `${backendURL}/api/students/delete/${encodeURIComponent(
          selectedStudent.rollNo
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({
          text: "Student deleted successfully",
          type: "success",
        });
        setSelectedStudent(null);
        setSearchTerm("");
        setShowDeleteConfirm(false);
      } else {
        throw new Error(data.message || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      setMessage({
        text: error.message || "Error deleting student",
        type: "error",
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate("/update-data")}
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-800 text-white shadow-sm"
            >
              <Database size={16} />
              <span>Update Data</span>
            </button>
            <button
              onClick={() => navigate("/delete-student")}
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Trash2 size={16} />
              <span>Delete Students</span>
            </button>
            <button
              onClick={() => navigate("/update-year")}
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Calendar size={16} />
              <span>Update Year</span>
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="px-4 py-4 mb-6 text-white rounded-xl shadow-lg sm:px-6 sm:py-6 sm:mb-8 bg-slate-800">
          <h1 className="flex items-center text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
            <Users className="mr-2 sm:mr-3" size={24} />
            <span className="sm:hidden">Student Mgmt</span>
            <span className="hidden sm:inline">Student Management</span>
          </h1>
        </div>

        {/* Main Content */}
        <div className="overflow-hidden bg-white rounded-xl shadow-md">
          {/* Search Controls */}
          <div className="px-6 py-6 border-b border-gray-200">
            {/* Search Type Toggle */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <span className="font-medium text-gray-700">Search by:</span>
              <div className="flex overflow-hidden rounded-md border border-gray-300">
                <button
                  type="button"
                  onClick={() => {
                    setSearchType("rollNo");
                    setSearchTerm("");
                    setNameSearchResults([]);
                    setRollNoSearchResults([]);
                    setShowNameDropdown(false);
                    setShowRollNoDropdown(false);
                  }}
                  className={`px-4 py-2 ${
                    searchType === "rollNo"
                      ? "bg-slate-800 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
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
                    setRollNoSearchResults([]);
                    setShowNameDropdown(false);
                    setShowRollNoDropdown(false);
                  }}
                  className={`px-4 py-2 ${
                    searchType === "name"
                      ? "bg-slate-800 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Name
                </button>
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    placeholder={`Enter student ${
                      searchType === "name" ? "name" : "roll number"
                    }...`}
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                      <div className="overflow-y-auto absolute z-10 mt-1 w-full max-h-60 bg-white rounded-lg border border-gray-300 shadow-lg">
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
                              {student.yearOfStudy}-{student.branch}-
                              {student.section}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Roll number search dropdown */}
                  {searchType === "rollNo" &&
                    showRollNoDropdown &&
                    rollNoSearchResults.length > 0 && (
                      <div className="overflow-y-auto absolute z-10 mt-1 w-full max-h-60 bg-white rounded-lg border border-gray-300 shadow-lg">
                        {rollNoSearchResults.map((student, index) => (
                          <div
                            key={index}
                            className="flex justify-between p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSelectRollNoStudent(student)}
                          >
                            <div>
                              <div className="font-medium">
                                {student.rollNo}
                              </div>
                              <div className="text-sm text-gray-600">
                                {student.name}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.yearOfStudy}-{student.branch}-
                              {student.section}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex justify-center items-center px-6 py-3 text-white rounded-lg transition-colors bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <Search className="mr-2 w-5 h-5" />
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Status Messages */}
          {message.text && (
            <div
              className={`mx-6 my-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : message.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-yellow-50 text-yellow-800 border border-yellow-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Student Profile/Edit Form */}
          {selectedStudent && (
            <div className="p-6">
              <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editMode ? "Edit Student Information" : "Student Profile"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {!editMode ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-slate-800 hover:bg-slate-700"
                      >
                        <Edit className="mr-2 w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
                      >
                        <Trash2 className="mr-2 w-4 h-4" />
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center px-4 py-2 text-white bg-gray-600 rounded-lg transition-colors hover:bg-gray-700"
                    >
                      <X className="mr-2 w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateStudent}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="">Select Type</option>
                        <option value="HOSTELLER">HOSTELLER</option>
                        <option value="DAY SCHOLAR">DAY SCHOLAR</option>
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
                        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
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
                        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="">Select Year</option>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                      </select>
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Branch
                      </label>
                      <select
                        name="branch"
                        value={updatedData.branch || ""}
                        onChange={handleInputChange}
                        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="">Select Branch</option>
                        <option value="AIDS">AI & DS</option>
                        <option value="AIML">AI & ML</option>
                      </select>
                    </div>

                    {/* Section */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Section
                      </label>
                      <select
                        name="section"
                        value={updatedData.section || ""}
                        onChange={handleInputChange}
                        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="">Select Section</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
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
                        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="">Select Option</option>
                        <option value="YES">YES</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-6 py-3 text-white rounded-lg transition-colors bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Roll Number
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.rollNo}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Name
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.name}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Student Type
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.hostellerDayScholar || "Not specified"}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Gender
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.gender || "Not specified"}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Year of Study
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.yearOfStudy || "Not specified"}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Branch
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.branch || "Not specified"}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Section
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.section || "Not specified"}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Parent Mobile Number
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.parentMobileNo || "Not specified"}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Student Mobile Number
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.studentMobileNo || "Not specified"}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                    <div className="mb-1 text-sm font-medium text-slate-800">
                      Super PACC
                    </div>
                    <div className="font-semibold text-gray-700">
                      {selectedStudent.superPacc || "Not specified"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* When no student is selected */}
          {!selectedStudent && !message.text && (
            <div className="flex flex-col justify-center items-center p-12 text-center">
              <User size={48} className="mb-4 text-slate-300" />
              <h3 className="mb-2 text-xl font-medium text-gray-700">
                No Student Selected
              </h3>
              <p className="max-w-md text-gray-500">
                Search for a student by roll number or name to view and manage
                their information.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 mx-4 w-full max-w-md bg-white rounded-xl shadow-xl">
            <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="mb-4 text-lg font-medium text-center text-gray-900">
              Confirm Delete
            </h3>
            <p className="mb-6 text-center text-gray-500">
              Are you sure you want to delete the student record for{" "}
              <span className="font-semibold">{selectedStudent?.name}</span> (
              {selectedStudent?.rollNo})? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={deleteStudent}
                disabled={deleteLoading}
                className="flex justify-center items-center px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700 focus:outline-none"
              >
                {deleteLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="mr-2 w-5 h-5" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
