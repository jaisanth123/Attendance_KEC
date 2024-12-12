import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes , Navigate} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import DutyPage from "./components/DutyPage";
import Absentees from "./components/Absentees";
import MessagePage from "./components/MessagePage";
import ViewAttendance from "./components/ViewAttendance";
import GenerateMessage from "./components/GenerateMessage";
import SignIn from "./components/SignIn";
import GenerateExcel from "./components/GenerateExcel";
import GenerateReport from "./components/GenerateReport";
import SendEmail from "./components/SendMail";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import NotFound from "./components/NotFound"; // Import the NotFound component
import UpdateAttendace from "./components/UpdateAttendance";
import Hostelreport from "./components/Hostelreport";
import ClassInfo from "./components/ClassInfo";
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleItemSelection = (item) => {
    setSelectedItem(item);
    setIsSidebarOpen(false);
  };

  const handleHomeClick = () => {
    if (window.location.pathname !== "/absentees") {
      setSelectedItem(null); // Reset selectedItem only if not on /absentees
    }
    setIsSidebarOpen(false);
  };

  // Close sidebar if clicked outside
  useEffect(() => {
    let isMounted = true;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isMounted) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      isMounted = false;
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const logoutHandler = () => {
    // Remove the token from sessionStorage
    sessionStorage.removeItem("authToken");
    // Redirect to the SignIn page
    window.location.href = "/signin";
  };


  return (
    <Router>
      <div className="flex flex-col h-screen">
        {/* Render Navbar only if authenticated */}
        { <Navbar toggleSidebar={toggleSidebar} logoutHandler={logoutHandler} />}

        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 transition-opacity duration-300 bg-black opacity-50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close Sidebar"
          ></div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 mt-20 md:mt-24">
          <Routes>
            {/* Authentication Pages */}
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="/signin" element={<SignIn />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/homePage" element={<HomePage toggleSidebar={toggleSidebar} />} />
              <Route path="/duty" element={<DutyPage selectedCourse={selectedItem} />} />
              <Route path="/absentees" element={<Absentees selectedCourse={selectedItem} />} />
              <Route path="/message" element={<MessagePage selectedCourse={selectedItem} toggleSidebar={toggleSidebar} />} />
              <Route path="/viewattendance" element={<ViewAttendance />} />
              <Route path="/update-attendance" element={<UpdateAttendace />} />
              <Route path="/generateMessage" element={<GenerateMessage toggleSidebar={toggleSidebar} />} />
              <Route path="/generateExcel" element={<GenerateExcel />} />
              <Route path="/send-email" element={<SendEmail />} />
              <Route path="/hostelreport" element={<Hostelreport />} />
              <Route path="/classinfo" element={<ClassInfo />} />
              <Route path="/generateReport" element={<GenerateReport />} />
            </Route>

            {/* Catch all unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        {/* Sidebar Component */}
        {isSidebarOpen && (
          <Sidebar
            ref={sidebarRef}
            closeSidebar={() => setIsSidebarOpen(false)}
            handleItemSelection={handleItemSelection}
            handleHomeClick={handleHomeClick}
          />
        )}
      </div>

      {/* ToastContainer for displaying toasts */}
      <ToastContainer />
    </Router>
  );
}

export default App;
