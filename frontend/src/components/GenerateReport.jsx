import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios"; // Import axios
import "react-toastify/dist/ReactToastify.css"; // Import the toast CSS
const backendURL = import.meta.env.VITE_BACKEND_URL;

const GenerateReport = () => {
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const [message, setMessage] = useState(""); // State to hold message when no students are absent
  const [dateMode, setDateMode] = useState("single");
  const [date, setDate] = useState(""); // State to store selected date
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState(""); 
  const [month, setMonth] = useState(""); 
  const [gender, setGender] = useState("ALL"); // State to store selected gender
  const [hostellerDayScholar, setHostellerDayScholar] = useState("ALL"); // Hosteller/Day Scholar selection
  const [yearOfStudy, setYearOfStudy] = useState(["ALL"]); // Selected years of study
  const [section, setSection] = useState(["ALL"]); // Selected sections
  const [branch, setBranch] = useState("CSE"); // Selected branch
  const navigate = useNavigate();

  const handleDateChange = (e) => setDate(e.target.value);
  const handleGenderChange = (e) => setGender(e.target.value);
  const handleHostellerDayScholarChange = (e) => setHostellerDayScholar(e.target.value);

  const handleYearOfStudyChange = (e) => {
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

  // Handle the button click to download the report
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
    const authToken = sessionStorage.getItem("authToken");

    if (!authToken) {
      toast.error("Authorization token is missing. Please log in again.", {
        autoClose: 800,
      });
      setIsLoading(false);
      return;
    }

    const yearQuery = yearOfStudy.join(",");
    const sectionQuery = section.join(",");
    const url = `${backendURL}/api/report/download-absent-report?gender=${gender}&dateMode=${dateMode}&date=${date}&startDate=${startDate}&endDate=${endDate}&month=${month}&hostellerDayScholar=${hostellerDayScholar}&yearOfStudy=${yearQuery}&section=${sectionQuery}&branch=${branch}`;

    axios
      .get(url, {
        responseType: "blob",
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const blob = response.data;
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "Absent_Students_Report.xlsx";
          link.click();
          setIsLoading(false);
          toast.success("Report downloaded successfully!", { autoClose: 800 });
        }
      })
      .catch((error) => {
        setIsLoading(false);

        if (error.response) {
          const { status, data } = error.response;

          if (status === 404) {
            const formattedDate = formatDate(date);
            setMessage(
              `No absent students found for specified criteria on ${formattedDate}.`
            );
            toast.info(
              `No absent students found for specified criteria on ${formattedDate}.`,
              { autoClose: 800 }
            );
          } else if (status === 403) {
            const errorMessage =
              data.message || "You are not authorized to access this page.";
            toast.error(`Error: ${errorMessage}`, { autoClose: 800 });
          } else {
            toast.error("An error occurred while generating the report.", {
              autoClose: 800,
            });
          }
        } else {
          toast.error("A network error occurred. Please try again later.", {
            autoClose: 800,
          });
        }
      });
  };

  return (
    <div className="flex justify-center items-start p-6 min-h-screen">
      <div className="p-6 w-full bg-gray-800 rounded-lg shadow-lg sm:w-96 md:w-80 lg:w-96 xl:w-1/3">
        <h2 className="mb-2 text-2xl font-semibold text-center text-white">
          Download Absentee Report
        </h2>

        {/* Date Mode Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">
            Date Mode:
          </label>
          <select
            value={dateMode}
            onChange={(e) => setDateMode(e.target.value)}
            className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="single">Single Date</option>
            <option value="range">Date Range</option>
            <option value="month">Month</option>
          </select>
        </div>

        {/* Date inputs */}
        {dateMode === "single" && (
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-300">
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
        )}

        {dateMode === "range" && (
          <div className="mb-4 flex space-x-2">
            <div className="w-1/2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                Start Date:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
                className="block px-3 py-2 mt-1 w-full text-white bg-gray-700 rounded-md border border-gray-500 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {dateMode === "month" && (
          <div className="mb-4">
            <label htmlFor="month" className="block text-sm font-medium text-gray-300">
              Month:
            </label>
            <input
              type="month"
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
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

        {/* Button to download report */}
        <button
          onClick={handleDownload}
          className={`w-full px-4 py-2 font-bold text-white transition duration-500 rounded-md shadow  ${
            isLoading
              ? "bg-gray-600 cursor-not-allowed hover:bg-gray-700"
              : "bg-blue-600 hover:scale-105"
          }`}
        >
          {isLoading ? "Loading..." : "Download Report"}
        </button>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)} // Replace with actual back navigation logic
          className="px-4 py-2 mt-4 w-full font-bold text-white bg-gray-600 rounded-md shadow transition duration-500 hover:scale-105 hover:bg-gray-700"
        >
          Back
        </button>

        {/* Display message if no students are absent */}
        {message && <p className="mt-4 text-center text-white">{message}</p>}
      </div>

      {/* Toast notifications */}
    </div>
  );
};

export default GenerateReport;
