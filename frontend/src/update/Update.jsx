import React from "react";
import { useNavigate } from "react-router-dom";
const backendURL = import.meta.env.VITE_BACKEND_URL; 

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
    <div className="flex flex-col h-full pt-10">
      <h1 className="text-4xl font-bold text-center text-gray-800">
        Update Options
      </h1>
      <div className="flex items-center justify-center h-full pt-10">
        <div className="grid w-full max-w-5xl grid-cols-2 gap-6 px-1 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {/* <div className="flex items-center justify-center h-full pt-10">
        <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4"> */}
          {/* Update Attendance Card */}

          {/* Update Student Data Card */}
          <ActionCard
            label="Update Student Data"
            onClick={() => navigate("/update-data")}
          />

          <ActionCard
            label="Update SuperPacc "
            onClick={() => navigate("/update-superpacc")}
          />
          {/* Update Password Card */}
          <ActionCard
            label="Add Student "
            onClick={() => navigate("/add-student")}
          />
          <ActionCard
            label="Update Password"
            onClick={() => navigate("/change-password")}
          />
        </div>
      </div>
    </div>
  );
}

export default Update;

