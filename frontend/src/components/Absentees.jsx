import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Absentees() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMarkingLoading, setIsMarkingLoading] = useState(false);
  const [isSuperMarkingLoading, setIsSuperMarkingLoading] = useState(false);

  // State variables
  const [date, setDate] = useState(
    location.state?.selectedDate || new Date().toISOString().split("T")[0]
  ); // Default to today's date

  const [yearOfStudy, setYearOfStudy] = useState("nan");
  const [branch, setBranch] = useState("nan");
  const [section, setSection] = useState("nan");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [rollNumbers, setRollNumbers] = useState([]);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false); // For Confirm button confirmation popup
  const [showMarkPresentPopup, setShowMarkPresentPopup] = useState(false); // For Mark Present button confirmation popup
  const [showMarkSuperPaccPopup, setShowMarkSuperPaccPopup] = useState(false); // For Mark Present button confirmation popup
  const [popupMessage, setPopupMessage] = useState(""); // To dynamically update popup messages
  const [popupColor, setPopupColor] = useState(""); // To dynamically update popup colors
  const [selectedRollNos, setSelectedRollNos] = useState([]); // To keep track of selected roll numbers
  const [markPresentDisabled, setMarkPresentDisabled] = useState(true); // Disable Mark Present button initially
  const [markPresentVisible, setMarkPresentVisible] = useState(false);
  const [showGenerateMessageButton, setShowGenerateMessageButton] =
    useState(false);
  const [markabsentbutton, setMarkabsentButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State to store the error message
  const [marksuperpacc, setmarksuperpacc] = useState(false);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    // Clear selected roll numbers whenever year, branch, section, or date changes
    setSelectedRollNos([]);
    setMarkPresentVisible(false);
    setmarksuperpacc(false);
    setMarkabsentButton(false);

    setErrorMessage("");

    if (
      yearOfStudy !== "nan" &&
      branch !== "nan" &&
      section !== "nan" &&
      date
    ) {
      // Update selectedCourse when dropdown values change
      const courseValue =
        section === "-"
          ? `${yearOfStudy} - ${branch}`
          : `${yearOfStudy} - ${branch} - ${section}`;
      setSelectedCourse(courseValue);
      fetchRollNumbers(yearOfStudy, branch, section, date);
    } else {
      setRollNumbers([]);
    }
  }, [yearOfStudy, branch, section, date]);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // Fetch roll numbers when parameters change
  const fetchRollNumbers = async (year, branch, section, selectedDate) => {
    // Use exact parameter names that match the controller's expectations
    const url = `${backendURL}/api/attendance/rollnumbers?yearOfStudy=${year}&branch=${branch}&section=${section}&date=${selectedDate}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data?.message) {
        if (
          data.message ===
          "Attendance has already been marked for all students."
        ) {
          setMarkabsentButton(true);
          setErrorMessage(data.message);
          setRollNumbers([]);
          setMarkPresentVisible(true);
          setmarksuperpacc(year === "III" || year === "IV");
          return;
        }

        setErrorMessage(data.message);
        setRollNumbers([]);
      } else if (data?.students?.length) {
        setMarkabsentButton(false);
        const fetchedRollNumbers = data.students.map((student) => ({
          rollNo: student.rollNo,
          name: student.name,
          isSelected: false,
        }));
        setRollNumbers(fetchedRollNumbers);
      } else {
        setErrorMessage("No students found for the selected criteria.");
        setRollNumbers([]);
      }
    } catch (error) {
      console.error("Error fetching roll numbers:", error);
      setErrorMessage("Failed to fetch data. Please try again.");
      setRollNumbers([]);
    }
  };

  const RollNumberCard = ({ rollNumber, isSelected, onClick, name }) => (
    <div
      onClick={onClick}
      className={`flex flex-col items-center justify-between p-6 text-white rounded-lg cursor-pointer shadow-md transition-transform transform ${
        isSelected ? "bg-red-600" : "bg-gray-700"
      } hover:scale-105 h-20 overflow-hidden`}
    >
      <div className="text-xl font-bold">{rollNumber}</div>
      {/* <div className="w-full text-xs text-center truncate">{name}</div> */}
    </div>
  );

  // Toggle selection of roll numbers
  const toggleSelection = (index) => {
    setRollNumbers((prevRollNumbers) => {
      const newRollNumbers = prevRollNumbers.map((rollNumber, i) =>
        i === index
          ? { ...rollNumber, isSelected: !rollNumber.isSelected }
          : rollNumber
      );

      // Update selectedRollNos array based on new selection state
      const selected = newRollNumbers.filter(
        (rollNumber) => rollNumber.isSelected
      );
      setSelectedRollNos(selected.map((rollNumber) => rollNumber.rollNo));

      // If any roll numbers are selected, enable Mark Present button
      setMarkPresentDisabled(selected.length === 0);
      return newRollNumbers;
    });
  };

  // Handle confirming the absentee list
  const handleConfirm = () => {
    const numSelected = selectedRollNos.length;

    if (numSelected === 0) {
      // Case 1: No roll numbers selected
      setPopupMessage(
        "No students are marked absent. Click confirm to proceed."
      );
      setPopupColor("bg-red-600"); // Red for confirmation popup
      setShowConfirmationPopup(true); // Show confirmation popup
    } else {
      // Case 2: Roll numbers are selected
      setPopupMessage(
        `${numSelected} students will be marked as absent. Click confirm to proceed.`
      );
      setPopupColor("bg-red-600");
      setShowConfirmationPopup(true);
    }
  };

  const handleConfirmationPopupOk = async () => {
    const numSelected = selectedRollNos.length;

    if (numSelected === 0) {
      toast.info("No students marked absent.", {
        autoClose: 800, // Increased auto-close duration for better visibility
      });
      setShowConfirmationPopup(false);
      setMarkPresentVisible(true);
      setmarksuperpacc(yearOfStudy === "III" || yearOfStudy === "IV");

      return; // Early return to p
      // revent further execution
    }

    try {
      // Make sure the server endpoint and data are correct
      const response = await axios.post(`${backendURL}/api/attendance/absent`, {
        rollNumbers: selectedRollNos,
        date,
        yearOfStudy,
        branch,
        section,
      });

      // Check the response status or data to ensure success
      if (response.status === 200) {
        toast.success(`Absent marked for ${numSelected} students.`, {
          autoClose: 800, // Increased auto-close duration
        });
      } else {
        throw new Error("Failed to mark attendance.");
      }

      setShowConfirmationPopup(false);
      setSelectedRollNos([]);
      await fetchRollNumbers(yearOfStudy, branch, section, date);
      setMarkPresentVisible(true);
      setmarksuperpacc(yearOfStudy === "III" || yearOfStudy === "IV");
    } catch (error) {
      console.error("Error marking absentees:", error);

      // Display a more detailed error message from the server, if available
      const errorMessage =
        error.response?.data?.message ||
        "Attendance already marked. Please try again.";
      toast.error(errorMessage, {
        autoClose: 3000, // Increased auto-close duration
      });
    }
  };

  const handleMarkPresentConfirm = async () => {
    setIsMarkingLoading(true);
    const data = { yearOfStudy, branch, section, date };

    try {
      const response = await axios.post(
        `${backendURL}/api/attendance/mark-remaining-present`,
        data
      );

      if (response.data.markedAsPresent === 0) {
        toast.info("Attendance is already marked for all students.", {
          autoClose: 800,
        });
        setMarkPresentVisible(false); // Hide Mark Present button
      } else {
        toast.success("Successfully marked remaining students as present.", {
          autoClose: 800,
        });
        setMarkPresentVisible(false);
        setShowGenerateMessageButton(true); // Show Generate Message button
      }
    } catch (error) {
      console.error("Error marking remaining students as present:", error);
      toast.error(
        "Error marking remaining students as present. Please try again.",
        {
          autoClose: 800,
        }
      );
    } finally {
      setIsMarkingLoading(false);
      setShowMarkPresentPopup(false); // Close the popup
      setShowMarkSuperPaccPopup(false);
      setSelectedRollNos([]); // Reset selectedRollNos array
      await fetchRollNumbers(yearOfStudy, branch, section, date); // Refresh the roll numbers after marking present
    }
  };

  const handleMarkSuperPaccConfirm = async () => {
    setIsSuperMarkingLoading(true); // Show loading indicator
    const data = { yearOfStudy, branch, section, date }; // Prepare payload
    setShowMarkSuperPaccPopup(false);
    try {
      // Make the POST request to the backend API
      const response = await axios.post(
        `${backendURL}/api/attendance/mark-SuperPacc`,
        data
      );

      // Handle the success response
      toast.success(`Successfully marked SuperPacc students!`, {
        autoClose: 800,
      });
      // Close the popup
      await fetchRollNumbers(yearOfStudy, branch, section, date);
      setmarksuperpacc(false); // Reset the flag
    } catch (error) {
      // Handle error
      console.error("Error marking SuperPacc attendance:", error);
      toast.error(
        "An error occurred while marking SuperPacc attendance. Please try again.",
        { autoClose: 800 }
      );
    } finally {
      setIsSuperMarkingLoading(false); // Hide loading indicator
    }
  };

  // Reusable Popup Component
  const ReusablePopup = ({
    show,
    message,
    color = "bg-gray-800", // Default color
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
  }) => {
    if (!show) return null;

    const popupStyles = {
      "bg-gray-800": "bg-gray-800 text-white", // Default fallback
    };

    return (
      <div className="flex fixed inset-0 justify-center items-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
        <div
          className={`p-8 rounded-lg shadow-lg ${
            popupStyles[color] || popupStyles["bg-gray-800"]
          }`}
        >
          <h2 className="mb-4 text-2xl font-semibold text-center">
            Confirm Action
          </h2>
          <p className="mb-6 text-center">{message}</p>
          <div className="flex justify-center space-x-6">
            {/* Confirm Button */}
            <button
              onClick={() => {
                onConfirm(); // Confirm action
                setShowMarkPresentPopup(false); // Close the popup
              }}
              className="px-6 py-2 font-semibold text-white bg-blue-700 rounded-md transition-colors hover:bg-blue-800"
            >
              {confirmText}
            </button>
            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className="px-6 py-2 font-semibold text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 items-center p-6 md:p-8 lg:p-12">
      <div className="p-6 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-semibold text-center text-white">
          Absentees Page
        </h1>

        {/* Dropdowns Row - Similar to DutyPage */}
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

      {/* Display error message on the page if there's one */}
      {errorMessage && (
        <div className="p-4 mb-4 font-bold text-red-600 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-6 w-full sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {rollNumbers.map((rollNumber, index) => (
          <RollNumberCard
            key={index}
            rollNumber={rollNumber.rollNo}
            name={rollNumber.name}
            isSelected={rollNumber.isSelected}
            onClick={() => toggleSelection(index)}
          />
        ))}
      </div>

      {selectedRollNos.length > 0 && (
        <div className="p-4 mt-6 w-full text-lg">
          <h4 className="mb-6 text-2xl font-semibold text-center text-gray-800">
            Selected Students:
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
            {selectedRollNos.map((rollNo, index) => {
              const student = rollNumbers.find(
                (student) => student.rollNo === rollNo
              );
              return (
                <div
                  key={index}
                  className="p-3 bg-red-100 rounded-lg shadow-sm"
                >
                  <div className="font-bold text-red-800">
                    {student?.rollNo}
                  </div>
                  <div className="text-sm text-gray-700">{student?.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-8 md:w-1/4 lg:w-1/5">
        {!markabsentbutton && (
          <button
            onClick={handleConfirm}
            disabled={
              yearOfStudy === "nan" || branch === "nan" || section === "nan"
            }
            className={`px-8 py-4 w-full text-xl font-semibold text-white rounded-lg transition-all duration-500 ${
              yearOfStudy === "nan" || branch === "nan" || section === "nan"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:scale-110 hover:bg-red-700"
            }`}
          >
            Mark Absentees
          </button>
        )}

        {(yearOfStudy === "III" || yearOfStudy === "IV") &&
          markPresentVisible &&
          marksuperpacc && (
            <button
              onClick={() => {
                setShowMarkSuperPaccPopup(true);
                setPopupMessage(
                  "Are you sure you want to mark SuperPacc students as OnDuty?"
                );
              }}
              disabled={isSuperMarkingLoading}
              className={`w-full px-8 py-4 text-xl duration-500 hover:scale-110 font-semibold rounded-lg transition-all ${
                isSuperMarkingLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "text-white bg-blue-600 hover:bg-blue-800"
              }`}
            >
              {isSuperMarkingLoading
                ? "Marking SuperPacc OD..."
                : "Mark SuperPacc OD"}
            </button>
          )}

        {markPresentVisible && (
          <button
            onClick={() => {
              setShowMarkPresentPopup(true);
            }}
            disabled={isMarkingLoading}
            className={`w-full px-8 py-4 text-xl transition-all duration-500 font-semibold rounded-lg hover:scale-110 ${
              isMarkingLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "text-white bg-green-600 hover:bg-green-700"
            }`}
          >
            {isMarkingLoading ? "Marking Present..." : "Mark Remaining Present"}
          </button>
        )}
        {/*
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
          disabled={
            yearOfStudy === "nan" || branch === "nan" || section === "nan"
          }
          className={`w-full px-8 py-4 text-xl duration-500 hover:scale-110 font-semibold rounded-lg transition-all ${
            yearOfStudy === "nan" || branch === "nan" || section === "nan"
              ? "bg-gray-400 cursor-not-allowed"
              : "text-white bg-blue-600 hover:bg-blue-800"
          }`}
        >
          Generate Message
        </button> */}

        <div className="mb-4 h-10">
          <button
            onClick={() => navigate("/homePage")} // Navigate to the home page
            className="px-8 py-4 w-full text-xl font-semibold text-white bg-gray-600 rounded-md transition-all duration-500 transform hover:bg-gray-700 hover:scale-110"
          >
            Home
          </button>
        </div>
      </div>

      {/* Confirmation Pop-ups */}
      <ReusablePopup
        show={showConfirmationPopup}
        message={
          selectedRollNos.length === 0
            ? "No students are marked absent. All will be marked present."
            : `${selectedRollNos.length} students will be marked as absent.`
        }
        color="bg-red-600" // Popup with red theme for absentees
        onConfirm={handleConfirmationPopupOk}
        onCancel={() => setShowConfirmationPopup(false)}
      />

      <ReusablePopup
        show={showMarkSuperPaccPopup} // Use the correct state
        message={popupMessage} // Dynamic message
        color={popupColor} // Dynamic color
        onConfirm={handleMarkSuperPaccConfirm} // Trigger the confirm function
        onCancel={() => setShowMarkSuperPaccPopup(false)} // Close popup on cancel
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <ReusablePopup
        show={showMarkPresentPopup}
        message="Are you sure you want to mark all remaining students as Present?"
        color="bg-green-600" // Popup with green theme for mark present
        onConfirm={handleMarkPresentConfirm}
        onCancel={() => setShowMarkPresentPopup(false)}
      />
    </div>
  );
}

export default Absentees;
