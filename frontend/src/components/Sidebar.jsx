import React, { useState, useEffect } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BsFillTriangleFill } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "react-modal";
import RoleFromToken from "./RoleFromToken";

// Set the root element for Modal
Modal.setAppElement("#root");

const FeatureSection = ({
  title,
  expandedFeature,
  toggleFeature,
  options,
  handleNavigation,
}) => (
  <div>
    <div
      className="flex justify-between items-center mt-12 mb-2 text-lg font-medium transition-all duration-500 cursor-pointer hover:text-gray-200 hover:scale-105"
      onClick={() => toggleFeature(title)}
      aria-expanded={expandedFeature === title}
    >
      <span className="text-xl">{title}</span>
      <BsFillTriangleFill
        className={`transition-transform ${
          expandedFeature === title ? "rotate-0" : "-rotate-180"
        } text-sm`}
      />
    </div>
    {expandedFeature === title && (
      <div className="pl-6 space-y-3 text-gray-300 text-md">
        {options.map((option, index) => (
          <p
            key={index}
            onClick={() => handleNavigation(option.path)}
            className="p-3 text-lg rounded-lg duration-500 cursor-pointer hover:bg-gray-700 hover:text-gray-100 hover:scale-110"
          >
            {option.label}
          </p>
        ))}
      </div>
    )}
  </div>
);

function Sidebar({ closeSidebar }) {
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = RoleFromToken();
    setRole(userRole);
  }, []);

  const toggleFeature = (feature) =>
    setExpandedFeature((prevFeature) =>
      prevFeature === feature ? null : feature
    );

  const handleHomeClick = () => {
    closeSidebar();
    navigate("/homePage");
  };

  const handleNavigation = (path) => {
    closeSidebar();
    navigate(path);
  };

  // Handle logout click
  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    sessionStorage.removeItem("authToken");
    toast.success("Successfully logged out.", {
      autoClose: 800,
    });
    closeSidebar();
    setIsModalOpen(false);
    navigate("/signin");
  };

  // Cancel logout
  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  // Define feature options
  const attendanceOptions = [
    { label: "Mark Attendance", path: "/absentees" },
    { label: "Mark On Duty", path: "/duty" },
  ];

  if (role === "staff" || role === "admin") {
    attendanceOptions.push({
      label: "Information Status",
      path: "/info-status",
    });
  }

  const viewOptions = [
    { label: "Classes Information", path: "/ClassInfo" },
    { label: "Generate Message", path: "/generateMessage" },
    { label: "Generate Report", path: "/generateReport" },
  ];

  const updateOptions = [
    { label: "Update Attendance", path: "/update-attendance" },
    { label: "Update Student Data", path: "/update-data" },
    { label: "Update Password", path: "/change-password" },
    { label: "Add Student", path: "/add-student" },
  ];

  return (
    <div className="flex fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={closeSidebar}
      ></div>
      <div
        className="flex overflow-y-auto fixed inset-y-0 left-0 flex-col justify-between p-6 w-64 text-white bg-gradient-to-b from-gray-900 to-gray-800 md:w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex justify-between items-center mb-10">
            <div
              onClick={handleHomeClick}
              className="flex items-center cursor-pointer"
            >
              <AiOutlineHome className="text-2xl hover:text-gray-300" />
              <span className="ml-2 text-xl font-semibold hover:text-gray-300">
                Home
              </span>
            </div>
            <MdClose
              onClick={closeSidebar}
              className="text-2xl cursor-pointer hover:text-gray-300"
            />
          </div>

          {/* Attendance Features */}
          <FeatureSection
            title="Attendance"
            expandedFeature={expandedFeature}
            toggleFeature={toggleFeature}
            options={attendanceOptions}
            handleNavigation={handleNavigation}
          />

          {/* View Attendance Features */}
          {(role === "admin" || role === "staff") && (
            <FeatureSection
              title="View Attendance"
              expandedFeature={expandedFeature}
              toggleFeature={toggleFeature}
              options={viewOptions}
              handleNavigation={handleNavigation}
            />
          )}

          {/* Update Data Features - Admin Only */}
          {role === "admin" && (
            <FeatureSection
              title="Update Data"
              expandedFeature={expandedFeature}
              toggleFeature={toggleFeature}
              options={updateOptions}
              handleNavigation={handleNavigation}
            />
          )}

          {/* Other Options - Admin Only */}
          {role === "admin" && (
            <FeatureSection
              title="Other Options"
              expandedFeature={expandedFeature}
              toggleFeature={toggleFeature}
              options={[{ label: "Leave Count", path: "/leave-count" }]}
              handleNavigation={handleNavigation}
            />
          )}
        </div>

        {/* Modal Trigger Button */}
        <button
          onClick={handleLogoutClick}
          className="px-4 py-2 mt-6 w-full text-sm font-semibold text-white bg-red-600 rounded transition-all duration-500 hover:scale-110 hover:bg-red-700"
        >
          Logout
        </button>

        {/* Confirmation Modal for Logout */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onRequestClose={cancelLogout}
            contentLabel="Logout Confirmation"
            className="flex fixed inset-0 justify-center items-center bg-black bg-opacity-50 z-60"
            overlayClassName="z-50 fixed inset-0 bg-black bg-opacity-50"
            closeTimeoutMS={200}
            autoFocus
          >
            <div className="p-6 w-3/4 text-center bg-gray-800 rounded-md shadow-lg sm:w-auto sm:px-4">
              <h2 className="p-6 mb-4 text-xl font-semibold text-white">
                Are you sure you want to log out?
              </h2>
              <div className="space-x-4">
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 text-white bg-red-800 rounded transition-all duration-500 hover:scale-110 hover:bg-red-600"
                >
                  Confirm
                </button>
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 text-white bg-gray-700 rounded transition-all duration-500 hover:scale-110 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
