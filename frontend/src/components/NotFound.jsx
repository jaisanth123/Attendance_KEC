import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  // Function to handle the "Go Back" button click
  const goBack = () => {
    navigate(-1); // This will take the user back to the previous page
  };

  // Function to go to home page
  const goHome = () => {
    navigate("/homePage");
  };

  // Function to go to signin page
  const goToSignIn = () => {
    navigate("/signin");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={goBack}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={goHome}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
          <button
            onClick={goToSignIn}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
