import React from "react";
import { useNavigate } from "react-router-dom";

// Reusing the same ActionCard component
const ActionCard = ({ label, onClick }) => (
  <div
    className="flex flex-col items-center justify-center h-64 p-6 transition-all duration-300 transform bg-slate-800 shadow-2xl cursor-pointer w-full sm:max-w-[10rem] md:max-w-[12rem] lg:max-w-[14rem] rounded-xl hover:bg-gray-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 active:scale-110"
    aria-label={`${label} card`}
    onClick={onClick}
  >
    <h3 className="text-3xl font-bold text-center text-white">{label}</h3>
  </div>
);

function Update() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col pt-10 h-full">
      <h1 className="text-4xl font-bold text-center text-gray-800">
        Update Options
      </h1>
      <div className="flex justify-center items-center pt-10 h-full">
        <div className="grid grid-cols-2 gap-6 px-1 w-full max-w-5xl sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {/* <div className="flex justify-center items-center pt-10 h-full">
        <div className="grid grid-cols-1 gap-4 w-full max-w-5xl sm:grid-cols-2 lg:grid-cols-3 lg:gap-4"> */}
          {/* Update Attendance Card */}
          <ActionCard
            label="Update Attendance"
            onClick={() => navigate("/update-attendance")}
          />

          {/* Update Student Data Card */}
          <ActionCard
            label="Update Student Data"
            onClick={() => navigate("/update-data")}
          />
          <ActionCard
            label="Update Password"
            onClick={() => navigate("/update-data")}
          />
          {/* Update Password Card */}
          <ActionCard
            label="Update Password"
            onClick={() => navigate("/update-password")}
          />
        </div>
      </div>
    </div>
  );
}

export default Update;
