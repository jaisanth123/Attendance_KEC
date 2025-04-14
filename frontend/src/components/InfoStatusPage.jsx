import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function InfoStatusPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // States for filters
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [yearOfStudy, setYearOfStudy] = useState("nan");
  const [section, setSection] = useState("nan");
  const [branch, setBranch] = useState("nan");

  // States for data
  const [absentStudents, setAbsentStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    // Clear selected students whenever filters change
    setSelectedStudents([]);

    if (
      yearOfStudy !== "nan" &&
      branch !== "nan" &&
      section !== "nan" &&
      date
    ) {
      fetchAbsentStudents(yearOfStudy, branch, section, date);
    } else {
      setAbsentStudents([]);
    }
  }, [yearOfStudy, branch, section, date]);

  const fetchAbsentStudents = async (
    yearOfStudy,
    branch,
    section,
    selectedDate
  ) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/attendance/not-informed-students`,
        {
          params: {
            yearOfStudy,
            branch,
            section,
            date: selectedDate,
          },
        }
      );

      const { students, message } = response.data;

      if (!students || students.length === 0) {
        setMessage(
          message ||
            `No pending absent students found for ${yearOfStudy} - ${branch} - ${section}`
        );
        setAbsentStudents([]);
        return;
      }

      setMessage("");
      const formattedStudents = students.map((student) => ({
        rollNo: student.rollNo,
        name: student.name,
        isSelected: false,
      }));
      setAbsentStudents(formattedStudents);
    } catch (error) {
      console.error("Error fetching absent students:", error);
      toast.error("Error fetching absent students. Please try again.");
      setAbsentStudents([]);
    }
  };

  const toggleSelection = (index) => {
    const student = absentStudents[index];
    setAbsentStudents((prevStudents) =>
      prevStudents.map((s, i) => ({
        ...s,
        isSelected: i === index ? !s.isSelected : s.isSelected,
      }))
    );

    setSelectedStudents((prev) => {
      const isCurrentlySelected = absentStudents[index].isSelected;
      if (!isCurrentlySelected) {
        return [...prev, student.rollNo];
      } else {
        return prev.filter((rollNo) => rollNo !== student.rollNo);
      }
    });
  };

  const handleUpdateInfoStatus = async (status) => {
    if (selectedStudents.length === 0) {
      toast.info("No students selected");
      return;
    }

    try {
      // Update info status for each selected student
      await Promise.all(
        selectedStudents.map(async (rollNo) => {
          await axios.post(
            "http://localhost:5000/api/attendance/update-info-status",
            {
              rollNo,
              date,
              infoStatus: status,
            }
          );
        })
      );

      toast.success(`${selectedStudents.length} students marked as ${status}`);
      setSelectedStudents([]);
      // Refresh the list
      await fetchAbsentStudents(yearOfStudy, branch, section, date);
      setIsConfirmed(false);
    } catch (error) {
      console.error("Error updating info status:", error);
      toast.error("Failed to update information status");
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center p-6 md:p-8 lg:p-12">
      <div className="p-6 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-semibold text-center text-white">
          Update Information Status
        </h1>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap gap-x-4 gap-y-4 justify-center mt-4 w-full">
          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label
              htmlFor="yearOfStudy"
              className="block text-lg font-medium text-white"
            >
              Year:
            </label>
            <select
              id="yearOfStudy"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
            >
              <option value="nan">Year</option>
              <option value="IV">IV</option>
              <option value="III">III</option>
              <option value="II">II</option>
            </select>
          </div>

          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label
              htmlFor="branch"
              className="block text-lg font-medium text-white"
            >
              Branch:
            </label>
            <select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
            >
              <option value="nan">Branch</option>
              <option value="AIDS">AIDS</option>
              <option value="AIML">AIML</option>
            </select>
          </div>

          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label
              htmlFor="section"
              className="block text-lg font-medium text-white"
            >
              Section:
            </label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
            >
              <option value="nan">Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="-">NA</option>
            </select>
          </div>
        </div>

        {/* Date Selection */}
        <div className="flex justify-center items-center pb-5 mt-8">
          <div className="w-full max-w-sm">
            <label
              htmlFor="date"
              className="block mb-2 text-lg font-medium text-center text-white"
            >
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="p-4 mt-6 w-full max-w-lg text-lg text-center text-red-500">
          {message}
        </div>
      )}

      {/* Absent Students Grid */}
      {absentStudents.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6 w-full sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          {absentStudents.map((student, index) => (
            <div
              key={index}
              onClick={() => toggleSelection(index)}
              className={`flex items-center justify-center p-6 text-white transition-all transform duration-500 text-xl font-semibold rounded-lg cursor-pointer shadow-md ${
                student.isSelected ? "bg-blue-600" : "bg-red-600"
              } hover:scale-110`}
            >
              {student.rollNo}
            </div>
          ))}
        </div>
      )}

      {/* Selected Students Display */}
      {selectedStudents.length > 0 && (
        <div className="p-4 mt-6 w-full text-lg text-black">
          <h4 className="mb-10 text-3xl font-semibold text-center">
            Selected Students:
          </h4>
          <div className="flex flex-col items-center space-y-4">
            {selectedStudents.map((rollNo, index) => {
              const student = absentStudents.find((s) => s.rollNo === rollNo);
              return (
                <span key={index} className="text-xl font-bold text-center">
                  {student ? `${student.rollNo} - ${student.name}` : rollNo}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 items-center mt-6 w-full">
        <button
          onClick={() => handleUpdateInfoStatus("Informed")}
          disabled={selectedStudents.length === 0}
          className={`w-full px-6 py-3 h-16 text-white transition-all text-xl duration-500 transform rounded-lg lg:w-1/4 md:w-1/3 ${
            selectedStudents.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 hover:scale-105"
          }`}
        >
          Mark as Informed
        </button>

        <button
          onClick={() => handleUpdateInfoStatus("NotInformed")}
          disabled={selectedStudents.length === 0}
          className={`w-full px-6 py-3 h-16 text-white transition-all text-xl duration-500 transform rounded-lg lg:w-1/4 md:w-1/3 ${
            selectedStudents.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 hover:scale-105"
          }`}
        >
          Mark as Not Informed
        </button>

        <button
          onClick={() => navigate("/homePage")}
          className="px-6 py-3 w-full h-16 text-xl text-white bg-gray-800 rounded-lg transition-all duration-500 transform hover:bg-gray-700 hover:scale-105 lg:w-1/4 md:w-1/3"
        >
          Home
        </button>
      </div>
    </div>
  );
}

export default InfoStatusPage;
