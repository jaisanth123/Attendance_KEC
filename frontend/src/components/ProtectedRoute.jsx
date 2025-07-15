// ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 rounded-full border-t-4 border-b-4 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If authenticated, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
