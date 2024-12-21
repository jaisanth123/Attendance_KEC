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

  const [selectedCourse, setSelectedCourse] = useState(
    location.state?.selectedCourse || "Select a course"
  );
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
  const [yearOfStudy, setYearOfStudy] = useState();
  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };
  useEffect(() => {
    if (selectedCourse && date) {
      fetchRollNumbers(selectedCourse, date);
      setErrorMessage("");
    }
  }, [selectedCourse, date]);

  // Fetch roll numbers sds selectedCoursor date changes
  // Fetch roll numbers when selectedCourse or date changes
  const fetchRollNumbers = async (course, selectedDate) => {
    let [yearOfStudy, branch, section] = course.split(" - ");
    section = yearOfStudy === "IV" ? "-" : section;
    setYearOfStudy(yearOfStudy);
    const url = `http://localhost:5000/api/attendance/rollnumbers?yearOfStudy=${yearOfStudy}&branch=${branch}&section=${section}&date=${selectedDate}`;
    console.log(url);

    try {
      const { data } = await axios.get(url);

      if (data?.message) {
        if (
          data.message ===
          "Attendance has already been marked for all students."
        ) {
          setMarkabsentButton(true);
          setErrorMessage(data.message);
          setRollNumbers([]); // Reset roll numbers
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
        setRollNumbers(fetchedRollNumbers); // Update roll numbers
      } else {
        setErrorMessage("No students found for the selected criteria.");
        setRollNumbers([]); // Reset roll numbers
      }
    } catch (error) {
      console.error("Error fetching roll numbers:", error);
      setErrorMessage("Failed to fetch data. Please try again.");
      setRollNumbers([]); // Reset roll numbers
    }
  };

  const RollNumberCard = ({ rollNumber, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-center p-6 text-white text-xl font-semibold rounded-lg cursor-pointer shadow-md transition-transform transform ${
        isSelected ? "bg-blue-600" : "bg-gray-700"
      } hover:scale-110`}
    >
      {rollNumber}
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
      setPopupMessage("No one marked absent. Click confirm to proceed.");
      setPopupColor("bg-red-600"); // Red for confirmation popup
      setShowConfirmationPopup(true); // Show confirmation popup
    } else {
      // Case 2: Roll numbers are selected
      setPopupMessage(
        `${numSelected} students marked as absent. Click confirm to proceed.`
      );
      setPopupColor("bg-red-600");
      setShowConfirmationPopup(true);
    }
  };

  const handleConfirmationPopupOk = async () => {
    const numSelected = selectedRollNos.length;

    if (numSelected === 0) {
      toast.info("No one marked absent.", {
        autoClose: 800, // Increased auto-close duration for better visibility
      });
      setShowConfirmationPopup(false);
      setMarkPresentVisible(true);
      setmarksuperpacc(true);

      return; // Early return to prevent further execution
    }

    try {
      const [yearOfStudy, branch, section] = selectedCourse.split(" - ");
      setYearOfStudy(yearOfStudy);

      // Make sure the server endpoint and data are correct
      const response = await axios.post(
        "http://localhost:5000/api/attendance/absent",
        {
          rollNumbers: selectedRollNos,
          date,
          yearOfStudy,
          branch,
          section,
        }
      );

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
      await fetchRollNumbers(selectedCourse, date);
      setMarkPresentVisible(true);
      setmarksuperpacc(true);
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
    const [yearOfStudy, branch, section] = selectedCourse.split(" - ");
    const data = { yearOfStudy, branch, section, date };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/attendance/mark-remaining-present",
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
      await fetchRollNumbers(selectedCourse, date); // Refresh the roll numbers after marking present
    }
  };

  const handleMarkSuperPaccConfirm = async () => {
    setIsSuperMarkingLoading(true); // Show loading indicator
    const [yearOfStudy, branch, section] = selectedCourse.split(" - "); // Parse selected course
    const data = { yearOfStudy, branch, section, date }; // Prepare payload
    setShowMarkSuperPaccPopup(false);
    try {
      // Make the POST request to the backend API
      const response = await axios.post(
        "http://localhost:5000/api/attendance/mark-SuperPacc",
        data
      );

      // Handle the success response
      toast.success(`Successfully marked SuperPacc students!`, {
        autoClose: 800,
      });
      // Close the popup
      await fetchRollNumbers(selectedCourse, date);
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
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
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
              className="px-6 py-2 font-semibold text-white transition-colors bg-blue-700 rounded-md hover:bg-blue-800"
            >
              {confirmText}
            </button>
            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className="px-6 py-2 font-semibold text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 md:p-8 lg:p-12">
      <div className="p-4 text-center text-black">
        <h1 className="text-4xl font-semibold">{selectedCourse}</h1>
        <h3 className="text-2xl font-semibold">Absentees Page</h3>
        <div className="w-full max-w-sm mt-6">
          <label htmlFor="date" className="block mb-2 text-xl font-medium ">
            Select Date:
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value), setSelectedRollNos([]);
            }}
            className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
      </div>
      {/* Display error message on the page if there's one */}
      {errorMessage && (
        <div className="p-4 mb-4 font-bold text-red-600 rounded-md ">
          {errorMessage}
        </div>
      )}
      <div className="grid w-full grid-cols-2 gap-4 mt-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
        {rollNumbers.map((rollNumber, index) => (
          <RollNumberCard
            key={index}
            rollNumber={rollNumber.rollNo}
            isSelected={rollNumber.isSelected}
            onClick={() => toggleSelection(index)}
          />
        ))}
      </div>
      {selectedRollNos.length > 0 && (
        <div className="w-full p-4 mt-6 text-lg text-black">
          <h4 className="mb-10 text-3xl font-semibold text-center">
            Selected Roll Numbers:
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {selectedRollNos.map((rollNo, index) => {
              const student = rollNumbers.find(
                (student) => student.rollNo === rollNo
              );
              return (
                <span key={index} className="text-xl font-bold ">
                  {student ? `${student.rollNo} - ${student.name}` : rollNo}
                </span>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4 mt-8 md:w-1/4 lg:w-1/5">
        {!markabsentbutton && (
          <button
            onClick={handleConfirm}
            className="w-full px-8 py-4 text-xl font-semibold text-white transition-all duration-500 bg-red-600 rounded-lg hover:scale-110 hover:bg-red-700"
          >
            Mark Absentees
          </button>
        )}

        {yearOfStudy === "III" && markPresentVisible && marksuperpacc && (
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
                : "bg-blue-600 hover:bg-blue-800 text-white"
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
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isMarkingLoading ? "Marking Present..." : "Mark Present"}
          </button>
        )}
        <div className="h-10 mb-4">
          <button
            onClick={() => navigate("/homePage")} // Navigate to the home page
            className="w-full px-8 py-4 text-xl font-semibold text-white transition-all duration-500 transform bg-gray-600 rounded-md hover:bg-gray-700 hover:scale-110"
          >
            Home
          </button>
        </div>
      </div>

      {/* Confirmation Pop-ups */}

      <ReusablePopup
        show={showConfirmationPopup}
        message={`${selectedRollNos.length} students will be marked as absent.`} // Updated message to show number of students selected
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
        message={`Are you sure mark remaining students as Present`} // Updated message to show number of students selected
        color="bg-green-600" // Popup with green theme for mark present
        onConfirm={handleMarkPresentConfirm}
        onCancel={() => setShowMarkPresentPopup(false)}
      />
    </div>
  );
}

export default Absentees;
