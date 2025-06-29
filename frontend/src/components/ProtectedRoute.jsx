// ProtectedRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = () => {
  const [showError, setShowError] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const token = sessionStorage.getItem("authToken"); // Get token from sessionStorage
  console.log('Token from sessionStorage:', token); // Log token to verify if it's retrieved

  useEffect(() => {
    if (!token) {
      setShowError(true);

      
      // Set a timeout to hide the error message after 2 seconds
      const timeout = setTimeout(() => {
        setShowError(false);
        setRedirect(true); // Set redirect to true after hiding error
      }, 800);

      // Clean up the timeout
      return () => clearTimeout(timeout);
    }
  }, [token]);

  if (redirect) {
    // Redirect after the error message disappears
    return <Navigate to="/signin" replace />;
  }
  
  if (!token) {
    // Show error message if no token
    return (
      <div>
        {showError && (
          <div className="text-2xl font-bold text-center text-red-600">
            You must be logged in to access this page.
          </div>
        )}
      </div>
    );
  }

  return <Outlet />; // Render child components if token exists
};

export default ProtectedRoute;


