import React, { useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BsFillTriangleFill } from "react-icons/bs";
import { MdClose } from "react-icons/md"; 
import { useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";
import Modal from "react-modal";

// Set the root element for Modal
Modal.setAppElement("#root");

const YearSection = ({ year, expandedYear, toggleYear, courses, handleItemSelection }) => (
  <div>
    <div
      className="flex items-center justify-between mt-6 mb-4 text-lg font-medium transition-all duration-500 cursor-pointer hover:text-gray-200 hover:scale-110"
      onClick={() => toggleYear(year)}
      aria-expanded={expandedYear === year}
    >
      <span>{year} Year</span>
      <BsFillTriangleFill className={`transition-transform ${expandedYear === year ? "rotate-0" : "-rotate-180"} text-sm`} />
    </div>
    {expandedYear === year && (
      <div className="pl-6 space-y-3 text-gray-300 text-md">
        {courses.map((course, index) => (
          <p
            key={index}
            onClick={() => handleItemSelection(course)}
            className="p-2 duration-500 rounded-lg cursor-pointer hover:bg-gray-700 hover:text-gray-100 hover:scale-110"
          >
            {course}
          </p>
        ))}
      </div>
    )}
  </div>
);

function Sidebar({ closeSidebar, handleItemSelection }) {
  const [expandedYear, setExpandedYear] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const navigate = useNavigate();

  const toggleYear = (year) => setExpandedYear(prevYear => prevYear === year ? null : year);
  const handleHomeClick = () => {
    closeSidebar();
    navigate("/homePage");
  };

  const handleCourseSelection = (course) => {
    closeSidebar();
    handleItemSelection(course);
    navigate("/absentees", { state: { selectedCourse: course } });
    window.location.reload();
  };

  // Handle logout click
  const handleLogoutClick = () => {
    setIsModalOpen(true); // Open the confirmation modal
  };

  // Confirm logout
  const confirmLogout = () => {
    sessionStorage.removeItem("authToken");



    toast.success("Successfully loggeddd out.", {
      autoClose: 800,
    });
    closeSidebar(); // Close the sidebar automatically
    setIsModalOpen(false); // Close the modal
    navigate("/signin");
  };

  // Cancel logout
  const cancelLogout = () => {
    setIsModalOpen(false); // Close the modal without logging out
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black opacity-50" onClick={closeSidebar}></div>
      <div className="fixed inset-y-0 left-0 flex flex-col justify-between w-64 p-6 text-white bg-gradient-to-b from-gray-900 to-gray-800 md:w-80" onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div onClick={handleHomeClick} className="flex items-center cursor-pointer">
              <AiOutlineHome className="text-2xl hover:text-gray-300" />
              <span className="ml-2 text-xl font-semibold hover:text-gray-300">Home</span>
            </div>
            <MdClose onClick={closeSidebar} className="text-2xl cursor-pointer hover:text-gray-300" />
          </div>

           <YearSection year="2nd" expandedYear={expandedYear} toggleYear={toggleYear} courses={["II - AIDS - A", "II - AIDS - B", "II - AIDS - C", "II - AIML - A", "II - AIML - B"]} handleItemSelection={handleCourseSelection} />
           <YearSection year="3rd" expandedYear={expandedYear} toggleYear={toggleYear} courses={["III - AIDS - A", "III - AIDS - B", "III - AIML - A", "III - AIML - B"]} handleItemSelection={handleCourseSelection} />
           <YearSection year="4th" expandedYear={expandedYear} toggleYear={toggleYear} courses={["IV - AIDS", "IV - AIML"]} handleItemSelection={handleCourseSelection} />
        </div>

        {/* Modal Trigger Button */}
        <button
          onClick={handleLogoutClick}
          className="w-full px-4 py-2 mt-6 text-sm font-semibold text-white transition-all duration-500 bg-red-600 rounded hover:scale-110 hover:bg-red-700"
        >
          Logout
        </button>

        {/* Confirmation Modal for Logout */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onRequestClose={cancelLogout}
            contentLabel="Logout Confirmation"
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60"
            overlayClassName="z-50 fixed inset-0 bg-black bg-opacity-50"
            closeTimeoutMS={200} // Smooth transition for modal close
            autoFocus // Ensures modal buttons are in focus
          >
            <div className="w-3/4 p-6 text-center bg-gray-800 rounded-md shadow-lg sm:w-auto sm:px-4 ">
              <h2 className="p-6 mb-4 text-xl font-semibold text-white">Are you sure you want to log out?</h2>
              <div className="space-x-4">
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 text-white transition-all duration-500 bg-red-800 rounded hover:scale-110 hover:bg-red-600"
                >
                  Confirm
                </button>
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 text-white transition-all duration-500 bg-gray-700 rounded hover:scale-110 hover:bg-gray-600"
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
















