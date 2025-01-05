import React from "react";
import { useNavigate } from "react-router-dom";

// Reusable Card Component
const ActionCard = ({ label, onClick }) => (
  <div
  className="flex flex-col items-center justify-center h-64 p-6 transition-all duration-500 transform bg-gray-800 shadow-2xl cursor-pointer w-full sm:max-w-[10rem] md:max-w-[12rem] lg:max-w-[14rem] rounded-xl hover:bg-gray-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 "
  aria-label={`${label} card`}
    onClick={onClick}
  >
    <h3 className="text-3xl font-bold text-center text-white">{label}</h3>
  </div>
);

function ViewAttendance({ toggleSidebar }) {
  const navigate = useNavigate();


  return (
    <>
      <div className="flex flex-col pt-10 h-3/4">
        <h1 className="text-4xl font-bold text-center text-gray-800 min-h-56">
          View Attendance Page
        </h1>
        <div className="flex items-center justify-center flex-grow">
          <div className="grid w-full max-w-4xl grid-cols-2 gap-6 px-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {/* Classes Information Card */}
            <ActionCard
              label="Classes Information"
              onClick={() => navigate("/ClassInfo")}
            />
  
            {/* Generate Message Card */}
            <ActionCard
              label="Generate Message"
              onClick={() => navigate("/generateMessage")}
            />
  
            {/* Generate Report Card */}
            <ActionCard
              label="Generate Report"
              onClick={() => navigate("/generateReport")}
            />
  
            {/* Generate Hostel Report Card */}
            {/* <ActionCard
              label="Generate Hostel Report"
              onClick={() => navigate("/hostelreport")}
            /> */}
          </div>
        </div>
  
        {/* Home Button as a Rectangle */}
        <div className="flex justify-center mt-0">
          <button
            className="w-64 h-16 py-2 mt-20 text-3xl font-bold text-white transition-all duration-500 transform bg-gray-700 shadow-md rounded-xl hover:scale-110 hover:bg-gray-800"
            onClick={() => navigate("/homePage")}
          >
            Home
          </button>
        </div>
      </div>
    </>
  );
  
}


export default ViewAttendance;
