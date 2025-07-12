import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the toast CSS
import { useNavigate } from "react-router-dom"; // Make sure you import the `useNavigate` hook from react-router-dom

const GenerateExcel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [gender, setGender] = useState("MALE");
  const [branch, setBranch] = useState("CSE");

  const navigate = useNavigate(); // Hook to navigate

  const handleDateChange = (e) => setDate(e.target.value);

  const handleGenderChange = (e) => setGender(e.target.value.toUpperCase());

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const handleDownload = () => {
    d;
    if (!date) {
      toast.info("Please select a date.", { autoClose: 800 });
      return;
    }

    setIsLoading(true);
    setMessage("");

    const url = `http://localhost:5000/api/report/downloadreport/${gender.toLowerCase()}?date=${date}&branch=${branch}`;

    fetch(url)
      .then((response) => {
        if (response.status === 404) {
          return response.json().then((data) => {
            const formattedDate = formatDate(date);
            setMessage(
              `No absent ${gender.toLowerCase()} students found for ${formattedDate}.`
            );
            setIsLoading(false);
            toast.info(
              `No absent ${gender.toLowerCase()} students found for ${formattedDate}.`,
              { autoClose: 800 }
            );
          });
        } else if (response.ok) {
          return response.blob().then((blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Absent_Students_Report.xlsx";
            link.click();
            setIsLoading(false);
            toast.success("Report downloaded successfully!", {
              autoClose: 800,
            });
          });
        } else {
          throw new Error("Something went wrong with the report generation");
        }
      })
      .catch((error) => {
        console.error("Error generating report:", error);
        toast.error("An error occurred while generating the report.", {
          autoClose: 800,
        });
        setIsLoading(false);
      });
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen">
      <div className="p-6 w-full max-w-md text-white bg-gray-800 rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-center">
          Absent mail generator
        </h2>
        {/* Date and Gender in same row */}
        <div className="flex gap-x-4 mb-4">
          <div className="flex-1">
            <label htmlFor="date" className="block mb-1 font-semibold">
              Date:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              className="p-2 w-full text-gray-900 rounded-md"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="gender" className="block mb-1 font-semibold">
              Gender:
            </label>
            <select
              id="gender"
              value={gender}
              onChange={handleGenderChange}
              className="p-2 w-full text-gray-900 rounded-md"
            >
              <option value="MALE">BOYS</option>
              <option value="FEMALE">GIRLS</option>
            </select>
          </div>
        </div>
        {/* Download Report Button */}
        <div className="mb-4">
          <button
            onClick={handleDownload}
            className={`mt-4  w-full py-2 transition-all duration-500 transform font-semibold rounded-md hover:scale-105 ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Generating Report..." : "Download Report"}
          </button>
        </div>
        {/* Navigate to Send Email Page */}
        //! ------------------------ updated
        -------------------------------------
        <div className="mb-4">
          <button
            onClick={() => navigate("/hostelreport")} // Adjust this path based on your route setup
            className="px-6 py-2 w-full font-semibold text-white bg-blue-600 rounded-md transition-all duration-500 transform hover:scale-105 hover:bg-blue-700"
          >
            Go to Send Email Page
          </button>
        </div>
        {/* <div className="mb-4">
  <button
    onClick={() => navigate("/send-email")} // Adjust this path based on your route setup
    className="px-6 py-2 w-full font-semibold text-white bg-blue-600 rounded-md transition-all duration-500 transform hover:scale-105 hover:bg-blue-700"
  >
    Go to Send Email Page
  </button>
</div> */}
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)} // This will go back to the previous page
            className="px-6 py-2 w-full font-semibold text-white bg-gray-600 rounded-md transition-all duration-500 transform hover:scale-105 hover:bg-gray-700"
          >
            Back
          </button>
        </div>
        {/* Home Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/homePage")} // Navigate to the home page
            className="py-2 w-full font-semibold bg-gray-600 rounded-md transition-all duration-500 transform hover:bg-gray-700 hover:scale-105"
          >
            Home
          </button>
        </div>
        {/* Message */}
        {message && (
          <p className="mt-4 text-sm text-center text-gray-400">{message}</p>
        )}
      </div>
    </div>
  );
};

export default GenerateExcel;
