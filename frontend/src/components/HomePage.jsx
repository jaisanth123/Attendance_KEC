import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RoleFromToken from "./RoleFromToken"; // Import the function to get the role from token

// Reusable Card Component
const ActionCard = ({ label, onClick }) => (
  <div
    className="flex flex-col items-center justify-center h-64 p-6 transition-all duration-300 transform bg-slate-800 shadow-2xl cursor-pointer w-full sm:max-w-[10rem] md:max-w-[12rem] lg:max-w-[14rem] rounded-xl hover:bg-gray-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 active:scale-110"
    aria-label={`${label} card`}
    onClick={onClick}
  >
    <h3 className="text-3xl font-bold text-center text-white">{label}</h3>
  </div>
);

function HomePage({ toggleSidebar }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Get the rolewqrwrS fasdfasrom the token when the component mounts
    const userRole = RoleFromToken();
    console.log("User Role:", userRole); // Log the role to check its value
    setRole(userRole);
  }, []);

  return (
    <div className="flex flex-col pt-10 h-full">
      <h1 className="text-4xl font-bold text-center text-gray-800">
        Home Page
      </h1>
      <div className="flex justify-center items-center pt-10 h-full">
        <div className="grid grid-cols-2 gap-6 px-1 w-full max-w-5xl sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {/* Attendance Card */}
          {/* //! --------------user cards section -------------- */}
          {role == "user" && (
            <>
              <ActionCard
                label="Mark Attendance"
                onClick={() => navigate("/absentees")}
              />
              <ActionCard
                label="Mark On Duty"
                onClick={() => navigate("/duty")}
              />
            </>
          )}
          {/* //! --------------staff cards section -------------- */}
          {role == "staff" && (
            <>
              <ActionCard
                label="Mark Attendance"
                onClick={() => navigate("/absentees")}
              />
              <ActionCard
                label="Mark On Duty"
                onClick={() => navigate("/duty")}
              />
              <ActionCard
                label="Information Status"
                onClick={() => navigate("/info-status")}
              />
              <ActionCard
                label="Leave Count"
                onClick={() => navigate("/leave-count")}
              />
            </>
          )}
          {/* //! --------------staff cards section -------------- */}
          {role === "admin" && (
            <>
              <ActionCard
                label=" Attendance"
                onClick={() => navigate("/attendance")}
              />

              <ActionCard
                label="Update Data"
                onClick={() => navigate("/update")}
              />
              <ActionCard
                label="Leave Count"
                onClick={() => navigate("/leave-count")}
              />
              <ActionCard
                label="Information Status"
                onClick={() => navigate("/info-status")}
              />
              <ActionCard
                label="HodInfo"
                onClick={() => navigate("/hodinfo")}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
