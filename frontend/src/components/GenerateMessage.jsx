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

  const [dateMode, setDateMode] = useState("single");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [month, setMonth] = useState("");
  const [gender, setGender] = useState("ALL");
  const [hostellerDayScholar, setHostellerDayScholar] = useState("ALL");
  const [yearOfStudy, setYearOfStudy] = useState(["ALL"]);
  const [section, setSection] = useState(["ALL"]);
  const [branch, setBranch] = useState("CSE");

  const handleDateChange = (e) => setDate(e.target.value);
  const handleGenderChange = (e) => {
    setGender(e.target.value.toUpperCase());
    setShowCard(false);
  };
  const handleHostellerDayScholarChange = (e) => {
    setHostellerDayScholar(e.target.value);
    setShowCard(false);
  };

  const handleYearOfStudyChange = (e) => {
    setShowCard(false);
    const value = e.target.value;
    if (value === "ALL") {
      setYearOfStudy(["ALL"]);
    } else {
      let newYears = yearOfStudy.filter((y) => y !== "ALL");
      if (newYears.includes(value)) {
        newYears = newYears.filter((y) => y !== value);
      } else {
        newYears.push(value);
      }
      if (newYears.length === 0) newYears = ["ALL"];
      setYearOfStudy(newYears);
    }
  };

  const handleSectionChange = (e) => {
    setShowCard(false);
    const value = e.target.value;
    if (value === "ALL") {
      setSection(["ALL"]);
    } else {
      let newSections = section.filter((s) => s !== "ALL");
      if (newSections.includes(value)) {
        newSections = newSections.filter((s) => s !== value);
      } else {
        newSections.push(value);
      }
      if (newSections.length === 0) newSections = ["ALL"];
      setSection(newSections);
    }
  };

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
    setStartDate(today);
    setEndDate(today);
    setMonth(today.substring(0, 7));
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
    if (dateMode === "single" && !date) {
      toast.info("Please select a date.", { autoClose: 800 });
      return;
    } else if (dateMode === "range" && (!startDate || !endDate)) {
      toast.info("Please select both start and end dates.", { autoClose: 800 });
      return;
    } else if (dateMode === "month" && !month) {
      toast.info("Please select a month.", { autoClose: 800 });
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
    const yearQuery = yearOfStudy.join(",");
    const sectionQuery = section.join(",");
    const url = `http://localhost:5000/api/report/absentStudentsCustom?gender=${gender}&dateMode=${dateMode}&date=${date}&startDate=${startDate}&endDate=${endDate}&month=${month}&hostellerDayScholar=${hostellerDayScholar}&yearOfStudy=${yearQuery}&section=${sectionQuery}&branch=${branch}`;

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
        {/* Date Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Date Mode:
          </label>
          <select
            value={dateMode}
            onChange={(e) => setDateMode(e.target.value)}
            style={{ padding: "5px", margin: "10px 0" }}
            className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="single">Single Date</option>
            <option value="range">Date Range</option>
            <option value="month">Month</option>
          </select>
        </div>

        {/* Date inputs */}
        {dateMode === "single" && (
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300">
              Date:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              style={{ padding: "5px", margin: "10px 0" }}
              className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {dateMode === "range" && (
          <div className="flex space-x-2">
            <div className="w-1/2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                Start Date:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: "5px", margin: "10px 0" }}
                className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
                End Date:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: "5px", margin: "10px 0" }}
                className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {dateMode === "month" && (
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-300">
              Month:
            </label>
            <input
              type="month"
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ padding: "5px", margin: "10px 0" }}
              className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        {/* Gender radio buttons */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gender:
          </label>
          <div className="flex space-x-4 text-white">
            <label className="flex items-center">
              <input type="radio" value="ALL" checked={gender === "ALL"} onChange={handleGenderChange} className="mr-2" /> ALL
            </label>
            <label className="flex items-center">
              <input type="radio" value="MALE" checked={gender === "MALE"} onChange={handleGenderChange} className="mr-2" /> BOYS
            </label>
            <label className="flex items-center">
              <input type="radio" value="FEMALE" checked={gender === "FEMALE"} onChange={handleGenderChange} className="mr-2" /> GIRLS
            </label>
          </div>
        </div>

        {/* Hostel Type radio buttons */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hostel Type:
          </label>
          <div className="flex space-x-4 text-white">
            <label className="flex items-center">
              <input type="radio" value="ALL" checked={hostellerDayScholar === "ALL"} onChange={handleHostellerDayScholarChange} className="mr-2" /> ALL
            </label>
            <label className="flex items-center">
              <input type="radio" value="HOSTELLER" checked={hostellerDayScholar === "HOSTELLER"} onChange={handleHostellerDayScholarChange} className="mr-2" /> HOSTELLER
            </label>
            <label className="flex items-center">
              <input type="radio" value="DAY SCHOLAR" checked={hostellerDayScholar === "DAY SCHOLAR"} onChange={handleHostellerDayScholarChange} className="mr-2" /> DAY SCHOLAR
            </label>
          </div>
        </div>

        {/* Year of Study checkboxes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Year of Study:
          </label>
          <div className="flex flex-wrap gap-4 text-white">
            {["ALL", "II", "III", "IV"].map(yr => (
              <label key={yr} className="flex items-center">
                <input 
                  type="checkbox" 
                  value={yr} 
                  checked={yearOfStudy.includes(yr)} 
                  onChange={handleYearOfStudyChange} 
                  className="mr-2" 
                /> {yr === "ALL" ? "ALL" : `${yr} Year`}
              </label>
            ))}
          </div>
        </div>

        {/* Section checkboxes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Section:
          </label>
          <div className="flex flex-wrap gap-4 text-white">
            {["ALL", "A", "B", "C", "D", "E", "F"].map(sec => (
              <label key={sec} className="flex items-center">
                <input 
                  type="checkbox" 
                  value={sec} 
                  checked={section.includes(sec)} 
                  onChange={handleSectionChange} 
                  className="mr-2" 
                /> {sec}
              </label>
            ))}
          </div>
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
