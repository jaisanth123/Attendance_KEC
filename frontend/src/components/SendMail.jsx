import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Importing toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importing styles for toast notifications

const SendEmail = () => {
  const [emailStatus, setEmailStatus] = useState("");
  const [file, setFile] = useState(null);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [toEmails, setToEmails] = useState("vikymahendiran123@gmail.com, bdvbusiness247@gmail.com,jaisanth2006@gmail.com"); // Default emails
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendEmail = async () => {
    if (!file) {
      toast.error("You have not uploaded a file.", {
        autoClose: 800,
      }); // Show error toast notification
      return;
    }

    setIsButtonClicked(true);

    const formData = new FormData();
    formData.append("file", file);
    const currentDate = new Date().toLocaleDateString('en-GB');
    formData.append("subject", `${currentDate} - Absentees Report`);
    formData.append("content", "Please find the attached Excel report.");
    formData.append("toEmails", toEmails); // Use the toEmails state
    const authToken = sessionStorage.getItem("authToken");
  
    if (!authToken) {
      toast.error("Authorization token is missing. Please log in again.", {
        autoClose: 800,
      });
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(
        //"http://localhost:5000/api/attendance/send-email",
        "http://localhost:5000/api/attendance/hostelreport",
        {
          method: "POST",
          body: formData,
          // headers: {
          //   'Authorization': `Bearer ${authToken}`, // Include the token in the Authorization header
          // },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmailStatus(data.message);
        toast.success("Email sent successfully!"); // Show success toast notification
      } else {
        setEmailStatus("Failed to send email.");
        toast.error("Failed to send email."); // Show error toast notification
      }
    } catch (error) {
      console.log(error);
      setEmailStatus("Error sending email.");
      toast.error("Error sending email."); // Show error toast notification
    } finally {
      setIsButtonClicked(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-lg p-8 bg-gray-800 rounded-lg shadow-3xl">
        <h1 className="mb-6 text-3xl font-semibold text-center text-white">Send Email with Excel File</h1>

        <div className="space-y-6">
          <div>
            <label htmlFor="file" className="block font-medium text-white text-md">Upload Excel File</label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".xls,.xlsx"
              className="w-full p-2 mt-2 text-white border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="emails" className="block font-medium text-white text-md ">To (Default: Absentees)</label>
            <input
              id="emails"
              type="text"
              value={toEmails}
              onChange={(e) => setToEmails(e.target.value)} // Update state when the user adds more emails
              placeholder="Enter additional email addresses separated by commas"
              className="w-full p-2 mt-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={sendEmail}
              className={`w-full py-3 px-6 rounded-lg transition-all text-2xl duration-500 hover:bg-gray-600 hover:scale-110 text-white font-semibold ${
                isButtonClicked ? "bg-gray-600" : "bg-gray-700"
              }`}
              disabled={isButtonClicked}
            >
              {isButtonClicked ? "Sending..." : "Send Email"}
            </button>
          </div>

        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => navigate(-1)} // Navigate to the previous page
            className="w-1/2 px-4 py-2 text-xl font-semibold text-white transition-transform duration-500 transform rounded-md bg-slate-700 hover:bg-slate-600 hover:scale-110"
          >
            Back
          </button>

          <button
            onClick={() => navigate("/")} // Navigate to the home page
            className="w-1/2 px-4 py-2 text-xl font-semibold text-white transition-transform duration-500 transform rounded-md bg-slate-700 hover:bg-slate-600 hover:scale-110"
          >
            Home
          </button>
        </div>
      </div>

      {/* Toast notifications container */}
      <ToastContainer />
    </div>
  );
};

export default SendEmail;
