import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DutyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showGenerateMessageButton, setShowGenerateMessageButton] =
    useState(false);

  const [date, setDate] = useState(
    location.state?.selectedDate || new Date().toISOString().split("T")[0]
  );
  const [rollNumbers, setRollNumbers] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedRollNumbers, setSelectedRollNumbers] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [yearOfStudy, setYearOfStudy] = useState("nan");
  const [section, setSection] = useState("nan");
  const [branch, setBranch] = useState("CSE");
  const [selectedCourse, setSelectedCourse] = useState("");

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    // Clear selected roll numbers whenever year, branch, section, or date changes
    setSelectedRollNumbers([]);
    setShowGenerateMessageButton(false);

    console.log("Triggering immediate fetch...");
    if (yearOfStudy !== "nan" && section !== "nan" && date) {
      fetchRollNumbers(yearOfStudy, branch, section, date);
    } else {
      setRollNumbers([]);
    }
  }, [yearOfStudy, branch, section, date]);

  const fetchRollNumbers = async (
    yearOfStudy,
    branch,
    section,
    selectedDate
  ) => {
    setSelectedCourse(`${yearOfStudy}-${branch}-${section}`);
    const url = `${backendURL}/api/students/remaining?yearOfStudy=${yearOfStudy}&branch=${branch}&section=${section}&date=${selectedDate}`;

    try {
      console.log("Fetching roll numbers from:", url);
      const response = await axios.get(url);
      console.log("API Response:", response.data);

      const { students } = response.data;
      const formattedDate = formatDate(selectedDate);

      if (!students || students.length === 0) {
        setMessage(
          `For ${yearOfStudy} - ${branch} - ${section}, no students are marked as Absent for ${formattedDate}.`
        );
        setRollNumbers([]);
        return;
      }

      setMessage("");
      const fetchedRollNumbers = students.map((student) => ({
        rollNo: student.rollNo,
        name: student.name,
        isSelected: false,
      }));
      console.log("Processed roll numbers:", fetchedRollNumbers);
      setRollNumbers(fetchedRollNumbers);
    } catch (error) {
      console.error("Error fetching roll numbers:", error);
      console.error("Error response:", error.response?.data);
      setMessage(
        "An error occurred while fetching roll numbers. Please try again later."
      );
      setRollNumbers([]);
      toast.error("Error fetching roll numbers. Please try again later.", {
        autoClose: 800,
      });
    }
  };

  const toggleSelection = (index) => {
    const rollNo = rollNumbers[index].rollNo;
    setRollNumbers((prevRollNumbers) =>
      prevRollNumbers.map((rollNumber, i) => {
        if (i === index) {
          const updatedSelection = !rollNumber.isSelected;

          setSelectedRollNumbers((prevSelected) => {
            if (updatedSelection) {
              if (!prevSelected.includes(rollNo)) {
                return [...prevSelected, rollNo];
              }
            } else {
              return prevSelected.filter((rollNoItem) => rollNoItem !== rollNo);
            }
            return prevSelected;
          });

          return { ...rollNumber, isSelected: updatedSelection };
        }
        return rollNumber;
      })
    );
  };

  const navigateToHome = () => {
    // Close the card before navigating
    navigate("/homePage"); // Navigate to home page
  };

  const handleConfirm = async () => {
    if (selectedRollNumbers.length === 0) {
      toast.info("0 Students are Marked as On Duty", {
        position: "top-right",
        autoClose: 800,
      });
      setShowGenerateMessageButton(true);
      setTimeout(() => {
        setIsConfirmed(false);
      }, 800);
      return;
    }

    const payload = {
      rollNumbers: selectedRollNumbers,
      date,
      yearOfStudy,
      branch,
      section,
    };

    console.log("Submitting On Duty payload:", payload);

    try {
      const response = await axios.post(
        `${backendURL}/api/attendance/onDuty`,
        payload
      );
      console.log("On Duty response:", response.data);

      if (response.status === 200) {
        toast.success(
          `${selectedRollNumbers.length} students marked as On Duty`,
          {
            autoClose: 800,
          }
        );

        // Reset states
        setIsConfirmed(false);
        setSelectedRollNumbers([]);
        setShowGenerateMessageButton(true);

        // Refresh the list to show updated data
        await fetchRollNumbers(yearOfStudy, branch, section, date);

        setTimeout(() => {
          setIsConfirmed(false);
        }, 800);
      } else {
        toast.error("Failed to mark OD. Please try again.", {
          autoClose: 800,
        });
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Error submitting OD. Please try again.", {
        autoClose: 800,
      });
    }
  };

  const handleClosePopup = () => {
    setIsConfirmed(false);
  };

  return (
    <div className="flex flex-col flex-1 items-center p-4 md:p-6 lg:p-8">
      <div className="p-4 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg md:p-6">
        <h1 className="mb-4 text-2xl font-semibold text-center text-white md:text-3xl lg:text-4xl md:mb-6">
          ON DUTY
        </h1>

        {/* Dropdowns Row - Similar to Absentees.jsx */}
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
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
            </select>
          </div>

          <div className="flex-1 min-w-[100px] max-w-[200px]">
            <label
              htmlFor="date"
              className="block text-lg font-medium text-white"
            >
              Date:
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
        <div className="p-3 mt-4 w-full max-w-lg text-sm text-center text-red-500 md:p-4 md:mt-6 md:text-lg">
          {message}
        </div>
      )}

      {/* Roll Numbers */}
      {rollNumbers.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4 w-full md:gap-4 md:mt-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {rollNumbers.map((rollNumber, index) => (
            <div
              key={index}
              onClick={() => toggleSelection(index)}
              className={`flex items-center justify-center p-3 md:p-6 text-white transition-all transform duration-500 text-sm md:text-xl font-semibold rounded-lg cursor-pointer shadow-md ${
                rollNumber.isSelected ? "bg-blue-600" : "bg-red-600"
              } hover:scale-110`}
            >
              {rollNumber.rollNo}
            </div>
          ))}
        </div>
      )}

      {selectedRollNumbers.length > 0 && (
        <div className="p-3 mt-4 w-full text-sm text-black md:p-4 md:mt-6 md:text-lg">
          <h4 className="mb-6 text-xl font-semibold text-center md:mb-10 md:text-3xl">
            Selected Roll Numbers:
          </h4>
          <div className="flex flex-col items-center space-y-2 md:space-y-4">
            {selectedRollNumbers.map((rollNo, index) => {
              const student = rollNumbers.find(
                (student) => student.rollNo === rollNo
              );
              return (
                <span
                  key={index}
                  className="text-sm font-bold text-center md:text-xl"
                >
                  {" "}
                  {student ? `${student.rollNo} - ${student.name}` : rollNo}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsConfirmed(true)}
        disabled={yearOfStudy === "nan" || section === "nan"}
        className={`w-full px-4 md:px-6 py-3 md:py-3 mt-6 md:mt-10 h-16 md:h-20 text-white transition-all text-lg md:text-2xl duration-500 transform rounded-lg lg:w-1/4 md:w-1/3 sm:w-1/2 ${
          yearOfStudy === "nan" || section === "nan"
            ? "bg-gray-400  cursor-not-allowed"
            : "bg-gray-800 hover:bg-gray-600 hover:scale-110"
        }`}
      >
        MARK OD
      </button>
      {
        <button
          onClick={() =>
            navigate("/message", {
              state: {
                yearOfStudy,
                branch,
                section,
                selectedDate: date,
                selectedCourse,
              },
            })
          }
          disabled={yearOfStudy === "nan" || section === "nan"}
          className={`w-full px-4 md:px-6 py-3 md:py-3 mt-3 md:mt-5 h-16 md:h-20 text-white transition-all text-lg md:text-2xl duration-500 transform rounded-lg lg:w-1/4 md:w-1/3 sm:w-1/2 ${
            yearOfStudy === "nan" || section === "nan"
              ? "bg-gray-400  cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-600 hover:scale-110"
          }`}
        >
          Generate Message
        </button>
      }

      <button
        onClick={navigateToHome}
        className="px-4 py-3 mt-3 w-full h-16 text-lg text-white bg-gray-800 rounded-lg transition-all duration-500 transform md:px-6 md:py-3 md:mt-5 md:h-20 md:text-2xl hover:bg-gray-600 hover:scale-110 lg:w-1/4 md:w-1/3 sm:w-1/2"
      >
        Home
      </button>

      {isConfirmed && (
        <div className="flex fixed inset-0 justify-center items-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
          <div className="p-6 w-80 bg-gray-800 rounded-lg shadow-lg transition-all duration-500 transform scale-110 md:p-8 md:w-96 animate-slideDown">
            <h2 className="mb-4 text-xl font-semibold text-center text-white md:text-2xl">
              Confirm Action
            </h2>
            <p className="mb-6 text-center text-white">
              {selectedRollNumbers.length > 0
                ? ` ${selectedRollNumbers.length} students are marked as On Duty`
                : "0 Students are marked as On Duty"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirm}
                className="px-4 py-2 w-24 text-white bg-blue-600 rounded-lg md:px-6 md:py-3 md:w-32 hover:bg-blue-700"
              >
                Yes
              </button>
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 w-24 text-white bg-gray-500 rounded-lg md:px-6 md:py-3 md:w-32 hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DutyPage;
