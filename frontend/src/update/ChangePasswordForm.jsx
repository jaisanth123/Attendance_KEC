import { useState } from "react";
import axios from "axios";
const backendURL = import.meta.env.VITE_BACKEND_URL; 

const EyeIcon = ({ visible }) =>
  visible ? (
    // Open Eye (Heroicons)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5s8.25 3 9.75 7.5c-1.5 4.5-5.25 7.5-9.75 7.5s-8.25-3-9.75-7.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    // Eye Slash (Heroicons)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.25 12c1.5 4.5 5.25 7.5 9.75 7.5 1.772 0 3.45-.37 4.98-1.023M6.228 6.228A10.477 10.477 0 0112 4.5c4.5 0 8.25 3 9.75 7.5a10.478 10.478 0 01-4.478 5.772M6.228 6.228l11.544 11.544M6.228 6.228L3 3m15 15l-3-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75a3 3 0 014.5 4.5" />
    </svg>
  );

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    role: "user",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  // ... rest of the state and handlers ...

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting formData:", formData); // <-- Add this line

    // Validation
    if (formData.newPassword.length < 6) {
      setMessage({
        text: "New password must be at least 6 characters long",
        type: "error",
      });
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({
        text: "New passwords do not match",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const endpoint = `${backendURL}/api/auth/user/change-password`;
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
          role: formData.role,
          username: formData.username,
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
          role: "User",
          username: "",
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

  // State for loading and message
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  return (
    <div className="p-6 mx-auto w-full max-w-md bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
        Change Password (Admin/Staff/User)
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
        {/* Role Dropdown */}
        <div>
          <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-700">
            Select Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="user">User</option>
          </select>
        </div>
        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Current Password Field */}
        <div className="relative">
          <label htmlFor="currentPassword" className="block mb-1 text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input
            type={showCurrentPassword ? "text" : "password"}
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-9 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowCurrentPassword((prev) => !prev)}
          >
            <EyeIcon visible={showCurrentPassword} />
          </button>
        </div>
        {/* New Password Field */}
        <div className="relative">
          <label htmlFor="newPassword" className="block mb-1 text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type={showNewPassword ? "text" : "password"}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-9 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowNewPassword((prev) => !prev)}
          >
            <EyeIcon visible={showNewPassword} />
          </button>
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 6 characters long
          </p>
        </div>
        {/* Confirm New Password Field */}
        <div className="relative">
          <label htmlFor="confirmNewPassword" className="block mb-1 text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type={showConfirmNewPassword ? "text" : "password"}
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-9 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmNewPassword((prev) => !prev)}
          >
            <EyeIcon visible={showConfirmNewPassword} />
          </button>
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

export default ChangePasswordForm;


