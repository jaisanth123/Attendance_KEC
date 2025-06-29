import { useState } from "react";
import axios from "axios";
const backendURL = import.meta.env.VITE_BACKEND_URL; 

const ChangePasswordForm = () => {
  const userType = "user";
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [passwordVisible, setPasswordVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field],
    });
  };

  const validatePassword = () => {
    if (formData.newPassword.length < 6) {
      setMessage({
        text: "New password must be at least 6 characters long",
        type: "error",
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({
        text: "New passwords do not match",
        type: "error",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Set the endpoint based on the user type
      const endpoint =
        userType === "admin"
          ? `${backendURL}/api/auth/admin/change-password`
          : `${backendURL}/api/auth/user/change-password`;

      // Get token from localStorage
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        setMessage({
          text: "You must be logged in to change your password",
          type: "error",
        });
        setLoading(false);
        return;
      }

      const response = await axios.put(
        endpoint,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage({
          text: "Password changed successfully!",
          type: "success",
        });
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        setMessage({
          text: response.data.message || "Failed to change password",
          type: "error",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error changing password. Please try again.";
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto w-full max-w-md bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
        Change {userType === "admin" ? "Admin" : "User"} Password
      </h2>

      {message.text && (
        <div
          className={`p-3 rounded-md mb-4 ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password Field */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Current Password
          </label>
          <div className="relative">
            <input
              type={passwordVisible.currentPassword ? "text" : "password"}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("currentPassword")}
              className="absolute top-2 right-3 text-gray-500"
            >
              {passwordVisible.currentPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password Field */}
        <div>
          <label
            htmlFor="newPassword"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <div className="relative">
            <input
              type={passwordVisible.newPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("newPassword")}
              className="absolute top-2 right-3 text-gray-500"
            >
              {passwordVisible.newPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 6 characters long
          </p>
        </div>

        {/* Confirm New Password Field */}
        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={passwordVisible.confirmNewPassword ? "text" : "password"}
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              required
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirmNewPassword")}
              className="absolute top-2 right-3 text-gray-500"
            >
              {passwordVisible.confirmNewPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 w-full text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {loading ? (
            <span className="flex justify-center items-center">
              <svg
                className="mr-2 w-5 h-5 text-white animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Change Password"
          )}
        </button>
      </form>
    </div>
  );
};

// Simple eye icon components
const EyeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

export default ChangePasswordForm;


