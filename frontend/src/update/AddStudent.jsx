import { useState } from "react";
import axios from "axios";
import { UserPlus, AlertCircle, CheckCircle, Loader } from "lucide-react";

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

    // Create a copy of the form data to modify
    const formDataToSubmit = {
      ...formData,
      // Convert entire name to uppercase
      name: formData.name.toUpperCase(),
      // Convert rollNo to uppercase
      rollNo: formData.rollNo.toUpperCase(),
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/students/create",
        formDataToSubmit
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
    <div className="px-4 py-8 min-h-screen bg-gray-100">
      <div className="mx-auto max-w-3xl">
        {/* Header Section */}
        <div className="px-6 py-6 mb-8 text-white rounded-xl shadow-lg bg-slate-800">
          <h1 className="flex items-center text-3xl font-bold">
            <UserPlus className="mr-3" size={30} />
            Add New Student
          </h1>
          <p className="mt-2 text-slate-300">
            Create a new student record in the database
          </p>
        </div>

        {/* Main Content */}
        <div className="overflow-hidden bg-white rounded-xl shadow-md">
          {/* Form Section */}
          <div className="p-6">
            {error && (
              <div className="flex items-center p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="flex-shrink-0 mr-2 w-5 h-5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center p-4 mb-6 text-green-700 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="flex-shrink-0 mr-2 w-5 h-5" />
                <p>Student created successfully!</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

                {/* Branch */}
                <div>
                  <label
                  
                    htmlFor="branch"
                    className="block mb-2 text-sm font-medium text-slate-800"
                  >
                    Branch *
                  </label>
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Select Branch</option>
                    <option value="AIDS">AI & DS</option>
                    <option value="AIML">AI & ML</option>
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="superPacc"
                  name="superPacc"
                  checked={formData.superPacc}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-slate-800 focus:ring-slate-500"
                />
                <label
                  htmlFor="superPacc"
                  className="ml-3 text-base text-gray-700"
                >
                  Super PACC
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 text-white rounded-lg transition-colors bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-400"
                >
                  {loading ? (
                    <>
                      <Loader className="mr-2 w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 w-5 h-5" />
                      Add Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;
