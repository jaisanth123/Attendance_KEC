import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const GenerateMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState([]);
  const [missingStudents, setMissingStudents] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCard, setShowCard] = useState(false);
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [gender, setGender] = useState("ALL");
  const [hostellerDayScholar, setHostellerDayScholar] = useState("ALL");
  const [yearOfStudy, setYearOfStudy] = useState("ALL");
  const [section, setSection] = useState("ALL");
  const [branch, setBranch] = useState("CSE");

  const handleDateChange = (e) => setDate(e.target.value);
  const handleGenderChange = (e) => setGender(e.target.value.toUpperCase());
  const handleHostellerDayScholarChange = (e) =>
    setHostellerDayScholar(e.target.value);
  const handleYearOfStudyChange = (e) => setYearOfStudy(e.target.value);
  const handleSectionChange = (e) => setSection(e.target.value);
  const handleBranchChange = (e) => setBranch(e.target.value);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  const copyCardContent = () => {
    const cardContent = document.getElementById("cardContent");
    const range = document.createRange();
    range.selectNodeContents(cardContent);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    try {
      document.execCommand("copy");
      toast.info("Content copied to clipboard!", { autoClose: 800 });
    } catch (err) {
      toast.error("Failed to copy content!", { autoClose: 800 });
    }
    selection.removeAllRanges();
  };

  const toggleCardVisibility = () => {
    setShowCard(!showCard);
  };

  const handleDownload = () => {
    if (!date) {
      toast.info("Please select a date.", { autoClose: 800 });
      return;
    }

    setIsLoading(true);
    setMessage("");
    setDetails([]);
    setMissingStudents([]);
    setErrorMessage("");

    const authToken = sessionStorage.getItem("authToken");

    if (!authToken) {
      setErrorMessage("Authorization token is missing. Please log in again.");
      setIsLoading(false);
      return;
    }

    // Construct the URL for the report
    const url = `http://localhost:5000/api/report/absentStudentsCustom?gender=${gender}&date=${date}&hostellerDayScholar=${hostellerDayScholar}&yearOfStudy=${yearOfStudy}&section=${section}&branch=${branch}`;

    // Add the Authorization header to the fetch request
    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setMessage(data.message);
          const detailsArray = data.details ? data.details.split("\n") : [];
          setDetails(detailsArray);
          setMissingStudents(data.missingStudents || []);
          setErrorMessage("");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("An error occurred. Please try again later.");
        setIsLoading(false);
      });
  };

  return (
    <div className="flex justify-center items-start p-6 min-h-screen">
      <div className="p-6 w-full bg-gray-800 rounded-lg shadow-lg sm:w-96 md:w-80 lg:w-96 xl:w-1/3">
        <h2 className="mb-2 text-2xl font-semibold text-center text-white">
          Generate Absentee Message
        </h2>
        {/* Date input field */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-300"
          >
            Date:
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={handleDateChange}
            className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Gender dropdown */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-300"
          >
            Gender:
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => {
              handleGenderChange(e);
              setShowCard(false);
            }}
            style={{ padding: "5px", margin: "10px 0" }}
            className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="MALE">BOYS</option>
            <option value="FEMALE">GIRLS</option>
            <option value="ALL">ALL</option>
          </select>
        </div>

        {/* Hosteller/Day Scholar dropdown */}
        <div>
          <label
            htmlFor="hostellerDayScholar"
            className="block text-sm font-medium text-gray-300"
          >
            Hostel Type:
          </label>
          <select
            id="hostellerDayScholar"
            value={hostellerDayScholar}
            onChange={(e) => {
              handleHostellerDayScholarChange(e);
              setShowCard(false);
            }}
            style={{ padding: "5px", margin: "10px 0" }}
            className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">ALL</option>
            <option value="HOSTELLER">HOSTELLER</option>
            <option value="DAY SCHOLAR">DAY SCHOLAR</option>
          </select>
        </div>

        {/* Year of Study dropdown */}
        <div>
          <label
            htmlFor="yearOfStudy"
            className="block text-sm font-medium text-gray-300"
          >
            Year of Study:
          </label>
          <select
            id="yearOfStudy"
            value={yearOfStudy}
            onChange={(e) => {
              handleYearOfStudyChange(e);
              setShowCard(false);
            }}
            style={{ padding: "5px", margin: "10px 0" }}
            className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">ALL</option>
            <option value="II">Second Year</option>
            <option value="III">Third Year</option>
            <option value="IV">Fourth Year</option>
          </select>
        </div>

        {/* Section dropdown */}
        <div>
          <label
            htmlFor="section"
            className="block text-sm font-medium text-gray-300"
          >
            Section:
          </label>
          <select
            id="section"
            value={section}
            onChange={(e) => {
              handleSectionChange(e);
              setShowCard(false);
            }}
            style={{ padding: "5px", margin: "10px 0" }}
            className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">ALL</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
          </select>
        </div>

        {/* Button to trigger report download */}
        <button
          onClick={() => {
            handleDownload();
            toggleCardVisibility();
          }}
          className="px-4 py-2 mt-2 w-full font-bold text-white bg-blue-600 rounded-md shadow transition duration-500 hover:scale-110 hover:bg-blue-700"
        >
          {isLoading ? "Generating Report..." : "Get Absent Students"}
        </button>
        <button
          onClick={() => navigate(-1)} // Replace with actual back navigation logic
          className="px-4 py-2 mt-4 w-full font-bold text-white bg-gray-600 rounded-md shadow transition duration-500 hover:scale-110 hover:bg-gray-700"
        >
          Back
        </button>

        {/* Display card with message and details */}
        {showCard &&
          (message ||
            details.length > 0 ||
            missingStudents.length > 0 ||
            errorMessage) && (
            <div className="p-6 mt-6 w-full text-gray-200 bg-gray-700 rounded-lg shadow-lg">
              <div id="cardContent">
                {message && (
                  <p
                    className="font-semibold"
                    dangerouslySetInnerHTML={{
                      __html: message.replace(/\n/g, "<br />"),
                    }}
                  />
                )}

                {details.length > 0 && (
                  <ul className="mt-2 space-y-2 list-none text-white">
                    {details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}

                {missingStudents.length > 0 && (
                  <p className="mt-4">
                    Missing Absentees: {missingStudents.length}
                  </p>
                )}

                {errorMessage && (
                  <div className="p-3 mt-4 text-red-400 bg-red-800 rounded">
                    <p>{errorMessage}</p>
                  </div>
                )}
              </div>

              {/* Copy content button */}
              <button
                onClick={copyCardContent}
                className="px-4 py-2 mt-4 font-semibold text-white bg-green-500 rounded hover:bg-green-600"
              >
                Copy Content
              </button>
            </div>
          )}
      </div>
      {/* ToastContainer to render toast notifications */}
    </div>
  );
};

export default GenerateMessage;
