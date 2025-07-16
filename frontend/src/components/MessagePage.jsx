import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import RoleFromToken from "./RoleFromToken"; // Import the function to get the role from token

const MessagePage = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null); // Store the role state

  const [yearOfStudy, setYearOfStudy] = useState("");
  const [section, setSection] = useState("");
  const [branch, setBranch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(
    location.state?.selectedCourse || "Select a course"
  );
  const [selectedDate, setSelectedDate] = useState(
    location.state?.selectedDate || ""
  );

  const [message, setMessage] = useState("");
  const [details, setDetails] = useState([]);
  const [missingStudents, setMissingStudents] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [showCard, setShowCard] = useState(false);

  // Reference to the card element
  const cardRef = useRef(null);

  // Format the date to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const copyCardContent = () => {
    const cardContent = document.getElementById("cardContent");

    const range = document.createRange();
    range.selectNodeContents(cardContent);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      document.execCommand("copy");
      toast.info("Content copied to clipboard!", {
        autoClose: 800,
      });
    } catch (err) {
      toast.error("Failed to copy content!", {
        autoClose: 800,
      });
    }

    selection.removeAllRanges();
  };

  const formatTextWithLineBreaks = (text) => {
    return text.replace(/\n/g, "<br />");
  };

  const getAbsentStudents = async (course, date) => {
    const [yearOfStudy, branch, section] = course.split("-");

    console.log("Fetching absent students for:", {
      yearOfStudy,
      branch,
      section,
      date,
    });

    try {
      const response = await axios.get(
        `http://localhost:5000/api/report/absentStudents?yearOfStudy=${yearOfStudy}&branch=${branch}&section=${section}&date=${date}`
      );

      console.log("API Response:", response.data);

      if (response.data.message) {
        setMessage(response.data.message);

        // Handle details - could be a string or array
        if (response.data.details) {
          if (typeof response.data.details === "string") {
            const detailsArray = response.data.details
              .split("\n")
              .filter((detail) => detail.trim() !== "");
            setDetails(detailsArray);
          } else if (Array.isArray(response.data.details)) {
            setDetails(response.data.details);
          } else {
            setDetails([]);
          }
        } else {
          setDetails([]);
        }

        setMissingStudents(response.data.missingStudents || []);
        setErrorMessage("");
      } else {
        setMessage("No message received from server");
        setDetails([]);
        setMissingStudents([]);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error fetching absent students:", error);
      console.error("Error response:", error.response?.data);

      if (error.response) {
        setErrorMessage(
          error.response.data.message || "An error occurred while fetching data"
        );
        setMissingStudents(error.response.data.missingStudents || []);
        setMessage("");
        setDetails([]);
      } else {
        setErrorMessage(
          "Network error. Please check your connection and try again."
        );
        setMissingStudents([]);
        setMessage("");
        setDetails([]);
      }
    }
  };

  const toggleCardVisibility = () => {
    setShowCard(!showCard);
  };

  // Close the card if the click is outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowCard(false);
      }
    };

    // Add event listener for clicks outside the card
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigateToAttendance = () => {
    setShowCard(false); // Close the card before navigating
    toggleSidebar(); // If it's related to sidebar toggle
  };

  const navigateToHome = () => {
    setShowCard(false); // Close the card before navigating
    navigate("/homePage"); // Navigate to home page
  };

  useEffect(() => {
    // Get the role from the token when the component mounts
    const userRole = RoleFromToken();
    console.log("User Role:", userRole); // Log the role to check its value
    setRole(userRole);

    // Log the received state data
    console.log("MessagePage received state:", location.state);
    console.log("Selected course:", selectedCourse);
    console.log("Selected date:", selectedDate);
  }, []);

  return (
    <div className="p-4 text-center text-black">
      <h1 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
        {selectedCourse}
      </h1>
      <h3 className="text-lg font-semibold md:text-xl lg:text-2xl">
        Message Page
      </h3>
      <h3 className="mt-2 mb-4 text-base font-semibold md:text-lg lg:text-xl">
        {formatDate(selectedDate)}
      </h3>

      <div className="flex flex-col gap-y-4 items-center">
        {/* Conditionally render Get Absentees Button based on role */}

        <div
          onClick={() => {
            getAbsentStudents(selectedCourse, selectedDate);
            toggleCardVisibility();
          }}
          className="p-6 mx-auto mt-6 w-full max-w-xs text-white bg-gray-800 rounded-lg shadow-lg transition-all duration-500 hover:scale-110 hover:bg-gray-600"
        >
          <button className="py-2 w-full text-2xl font-semibold text-whiterounded-lg">
            Get Absentees
          </button>
        </div>

        {showCard &&
          (message ||
            details.length > 0 ||
            missingStudents.length > 0 ||
            errorMessage) && (
            <div
              ref={cardRef}
              className="p-6 mx-auto mt-6 w-full h-auto bg-white rounded-lg border-2 border-gray-300 shadow-lg sm:w-3/4 md:w-2/3 lg:w-1/2"
            >
              <div id="cardContent">
                {message && (
                  <div className="mt-4">
                    <p
                      className="font-semibold text-gray-800"
                      dangerouslySetInnerHTML={{
                        __html: formatTextWithLineBreaks(message),
                      }}
                    />
                  </div>
                )}

                {Array.isArray(details) && details.length > 0 && (
                  <div className="mt-4">
                    <ul className="mt-2 space-y-2 list-none text-gray-700">
                      {details.map((detail, index) => (
                        <li key={index} className="font-bold">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 mt-4 bg-red-50 rounded border border-red-300">
                    <p className="text-red-600">{errorMessage}</p>
                  </div>
                )}

                {missingStudents.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xl font-semibold text-red-600">
                      Missing Attendance Records: {missingStudents.length}
                    </p>
                    <div className="p-3 mt-2 bg-yellow-50 rounded border border-yellow-300">
                      <p className="mb-2 text-sm text-yellow-800">
                        The following students don't have attendance records:
                      </p>
                      <ul className="text-sm text-yellow-700">
                        {missingStudents.map((student, index) => (
                          <li key={index} className="font-medium">
                            {student.rollNo} - {student.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={copyCardContent}
                className="px-6 py-2 mt-4 font-semibold text-white bg-blue-800 rounded-lg shadow-lg transition-all duration-500 hover:bg-blue-600 hover:scale-110"
              >
                Copy Content
              </button>
            </div>
          )}

        {/* Attendance Button */}

        {/* Home Button */}
        <div
          onClick={navigateToHome}
          className="p-6 mx-auto mt-6 w-full max-w-xs text-white bg-gray-800 rounded-lg shadow-lg transition-all duration-500 hover:bg-gray-600 hover:scale-110"
        >
          <button className="py-2 w-full text-2xl font-semibold text-white">
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
