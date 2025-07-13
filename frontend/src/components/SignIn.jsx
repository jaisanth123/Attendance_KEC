import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API requests
import { ToastContainer, toast } from "react-toastify"; // Import toastify
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
const backendURL = import.meta.env.VITE_BACKEND_URL;

// Debug: Log the backend URL to console

function SignIn() {
  const navigate = useNavigate();

  // State for form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default to 'user'
  const [showPassword, setShowPassword] = useState(false); // State for showing password

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from redirecting

    try {
      // Create the payload based on role
      const payload = {
        username,
        password,
      };

      // Send login request based on role
      let response;
      if (role === "user") {
        response = await axios.post(
          `${backendURL}/api/auth/login/user`,
          payload
        );
      } else if (role === "staff") {
        response = await axios.post(
          `${backendURL}/api/auth/login/staff`,
          payload
        );
      } else {
        response = await axios.post(
          `${backendURL}/api/auth/login/admin`,
          payload
        );
      }

      // Save the token in sessionStorage
      const token = response.data.token;
      sessionStorage.setItem("authToken", token); // Store token in sessionStorage

      // Show success toast
      toast.success(response.data.message, {
        autoClose: 800, // Timeout for toast to disappear after 2 seconds
      });

      // Wait for 2 seconds, then navigate to the homepage
      setTimeout(() => {
        navigate("/homePage"); // Redirect to homepage after sign-in
      }, 800);
    } catch (error) {
      // Show error toast if authentication fails
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
        {
          autoClose: 800,
        }
      );
    }
  };

  // Toggle password visibilit1
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      {/* Navbar without logout and sidebar toggle */}
      <nav className="fixed top-0 right-0 left-0 z-50 mt-2 bg-gray-800 shadow-md">
        {/* For large screens */}
        <div className="hidden justify-between items-center px-4 py-4 text-white sm:flex sm:py-6">
          {/* Sidebar Toggle Button */}

          {/* Title centered for large screens */}
          <div className="flex-1 ml-40 text-xl font-semibold text-center whitespace-nowrap">
            ATTENDANCE AI DEPARTMENT
          </div>

          {/* Date */}
          <div className="text-lg sm:block lg:text-xl sm:mt-2">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
          </div>
        </div>

        {/* For small screens */}
        <div className="px-4 py-2 text-white sm:hidden">
          {/* Icon and Title in one row */}
          <div className="flex items-center">
            {/* Sidebar Toggle Icon (positioned in the middle of the left side) */}

            {/* Title centered in one line */}
            <div className="flex-grow text-lg font-semibold text-center">
              ATTENDANCE AI DEPARTMENT
            </div>
          </div>

          {/* Date on a separate row below */}
          <div className="mt-1 text-sm text-center">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </nav>
      {/* Sign In Form */}
      <div className="flex justify-center items-center h-screen transition-transform duration-1000">
        <div className="p-6 space-y-8 w-full max-w-md bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-white">Sign In</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              className="p-3 w-full text-white bg-gray-700 rounded-lg transition-transform duration-1000 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Handle username input change
              required
              autoComplete="username" // Auto-complete for username
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password type
                placeholder="Password"
                className="p-3 w-full text-white bg-gray-700 rounded-lg transition-transform duration-1000 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Handle password input change
                required
                autoComplete="current-password" // Auto-complete for password
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute top-3 right-3 text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Toggle icon */}
              </button>
            </div>
            <div>
              <label className="block text-white">Role</label>
              <select
                className="p-3 w-full text-white bg-gray-700 rounded-lg focus:outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value)} // Handle role selection change
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <button
              type="submit"
              className="p-3 w-full font-bold text-white bg-blue-600 rounded-lg transition-transform duration-1000 hover:bg-blue-500"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Toast Container to show notifications */}
      </div>
    </div>
  );
}

export default SignIn;
