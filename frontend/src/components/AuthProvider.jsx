import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const validateToken = async (token) => {
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.post(
        `${backendURL}/api/auth/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.valid;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  const checkAuthStatus = async () => {
    const token = sessionStorage.getItem("authToken");

    if (token) {
      try {
        // Decode token to check if it's expired
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          // Token is expired
          sessionStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setUser(null);
        } else {
          // Token is valid
          setIsAuthenticated(true);
          setUser(decoded);
        }
      } catch (error) {
        console.error("Token decode error:", error);
        sessionStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (token) => {
    sessionStorage.setItem("authToken", token);
    const decoded = jwtDecode(token);
    setIsAuthenticated(true);
    setUser(decoded);
  };

  const logout = () => {
    sessionStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
