import { useState } from "react";
import axios from "axios";
import {
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader,
  Upload,
} from "lucide-react";
import UploadCsv from "./UploadCsv";
const backendURL = import.meta.env.VITE_BACKEND_URL;

function AddStudent() {
  const [isIndividualForm, setIsIndividualForm] = useState(true);
  const [formData, setFormData] = useState({
    rollNo: "",
    name: "",
    hostellerDayScholar: "",
    gender: "",
    yearOfStudy: "",
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

    const formDataToSubmit = {
      ...formData,
      name: formData.name.toUpperCase(),
      rollNo: formData.rollNo.toUpperCase(),
      branch: "CSE",
    };

    try {
      const response = await axios.post(
        `${backendURL}/api/students/create`,
        formDataToSubmit
      );
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          rollNo: "",
          name: "",
          hostellerDayScholar: "",
          gender: "",
          yearOfStudy: "",
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
    <div className="h-[calc(100vh-5rem)] overflow-hidden bg-slate-50">
      <div className="px-4 py-4 mx-auto max-w-4xl h-full">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center p-4 bg-white rounded-lg border shadow-sm border-slate-200">
            <h1 className="flex items-center text-xl font-semibold text-slate-800">
              <UserPlus className="mr-2 w-5 h-5 text-slate-600" />
              Add New Student
            </h1>

            {/* Toggle Switch */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsIndividualForm(true)}
                className={`px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors ${
                  isIndividualForm
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <UserPlus size={16} />
                <span>Individual</span>
              </button>
              <button
                onClick={() => setIsIndividualForm(false)}
                className={`px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors ${
                  !isIndividualForm
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Upload size={16} />
                <span>CSV Upload</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100%-6rem)] overflow-auto">
          {isIndividualForm ? (
            <div className="p-6 bg-white rounded-lg border shadow-sm border-slate-200">
              {error && (
                <div className="flex items-center p-3 mb-4 text-red-700 bg-red-50 rounded-md border border-red-100">
                  <AlertCircle className="flex-shrink-0 mr-2 w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center p-3 mb-4 text-green-700 bg-green-50 rounded-md border border-green-100">
                  <CheckCircle className="flex-shrink-0 mr-2 w-4 h-4" />
                  <p className="text-sm">Student created successfully!</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Roll Number */}
                  <div>
                    <label
                      htmlFor="rollNo"
                      className="block mb-2 text-sm font-medium text-slate-800"
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
                      className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="Enter roll number"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium text-slate-800"
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
                      className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* Hosteller/Day Scholar */}
                  <div>
                    <label
                      htmlFor="hostellerDayScholar"
                      className="block mb-2 text-sm font-medium text-slate-800"
                    >
                      Hosteller/Day Scholar *
                    </label>
                    <select
                      id="hostellerDayScholar"
                      name="hostellerDayScholar"
                      value={formData.hostellerDayScholar}
                      onChange={handleChange}
                      className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="HOSTELLER">HOSTELLER</option>
                      <option value="DAY SCHOLAR">DAY SCHOLAR</option>
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label
                      htmlFor="gender"
                      className="block mb-2 text-sm font-medium text-slate-800"
                    >
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                    </select>
                  </div>

                  {/* Year of Study */}
                  <div>
                    <label
                      htmlFor="yearOfStudy"
                      className="block mb-2 text-sm font-medium text-slate-800"
                    >
                      Year of Study *
                    </label>
                    <select
                      id="yearOfStudy"
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>

                  {/* Section */}
                  <div>
                    <label
                      htmlFor="section"
                      className="block mb-2 text-sm font-medium text-slate-800"
                    >
                      Section *
                    </label>
                    <select
                      id="section"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      required
                    >
                      <option value="">Select Section</option>
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
                      className="block mb-2 text-sm font-medium text-slate-800"
                    >
                      Parent Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="parentMobileNo"
                      name="parentMobileNo"
                      value={formData.parentMobileNo}
                      onChange={handleChange}
                      className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="Enter parent's mobile number"
                    />
                  </div>

                  {/* Student Mobile Number */}
                  <div>
                    <label
                      htmlFor="studentMobileNo"
                      className="block mb-2 text-sm font-medium text-slate-800"
                    >
                      Student Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="studentMobileNo"
                      name="studentMobileNo"
                      value={formData.studentMobileNo}
                      onChange={handleChange}
                      className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="Enter student's mobile number"
                    />
                  </div>
                </div>

                {/* SuperPACC Checkbox */}
                <div className="flex items-center pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="superPacc"
                    name="superPacc"
                    checked={formData.superPacc}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-slate-800 focus:ring-slate-500"
                  />
                  <label
                    htmlFor="superPacc"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Super PACC
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 text-sm text-white rounded-md shadow-sm transition-colors bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-400"
                  >
                    {loading ? (
                      <>
                        <Loader className="mr-2 w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 w-4 h-4" />
                        Add Student
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-lg border shadow-sm border-slate-200">
              <UploadCsv />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddStudent;
