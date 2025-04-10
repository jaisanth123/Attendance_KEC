import { useState } from "react";
import axios from "axios";

function AddStudent() {
  const [formData, setFormData] = useState({
    rollNo: "",
    name: "",
    hostellerDayScholar: "",
    gender: "",
    yearOfStudy: "",
    branch: "",
    section: "",
    parentMobileNo: "",
    studentMobileNo: "",
    superPacc: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/students/create",
        formData
      );
      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          rollNo: "",
          name: "",
          hostellerDayScholar: "",
          gender: "",
          yearOfStudy: "",
          branch: "",
          section: "",
          parentMobileNo: "",
          studentMobileNo: "",
          superPacc: false,
        });
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while creating the student"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto max-w-2xl bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Add New Student</h2>

      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded border border-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 text-green-700 bg-green-100 rounded border border-green-400">
          Student created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Roll Number */}
          <div>
            <label
              htmlFor="rollNo"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Roll Number *
            </label>
            <input
              type="text"
              id="rollNo"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              required
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Hosteller/Day Scholar */}
          <div>
            <label
              htmlFor="hostellerDayScholar"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Hosteller/Day Scholar*
            </label>
            <select
              id="hostellerDayScholar"
              name="hostellerDayScholar"
              value={formData.hostellerDayScholar}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select</option>
              <option value="Hosteller">Hosteller</option>
              <option value="Day Scholar">Day Scholar</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Gender*
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Year of Study */}
          <div>
            <label
              htmlFor="yearOfStudy"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Year of Study*
            </label>
            <select
              id="yearOfStudy"
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
          </div>

          {/* Branch */}
          <div>
            <label
              htmlFor="branch"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Branch*
            </label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>

              <option value="AIDS">AI & DS</option>
              <option value="AIML">AI & ML</option>
            </select>
          </div>

          {/* Section */}
          <div>
            <label
              htmlFor="section"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Section*
            </label>
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          {/* Parent Mobile Number */}
          <div>
            <label
              htmlFor="parentMobileNo"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Parent Mobile Number
            </label>
            <input
              type="tel"
              id="parentMobileNo"
              name="parentMobileNo"
              value={formData.parentMobileNo}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Student Mobile Number */}
          <div>
            <label
              htmlFor="studentMobileNo"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Student Mobile Number
            </label>
            <input
              type="tel"
              id="studentMobileNo"
              name="studentMobileNo"
              value={formData.studentMobileNo}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* SuperPACC Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="superPacc"
            name="superPacc"
            checked={formData.superPacc}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label
            htmlFor="superPacc"
            className="block ml-2 text-sm text-gray-700"
          >
            Super PACC
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {loading ? "Creating..." : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddStudent;
