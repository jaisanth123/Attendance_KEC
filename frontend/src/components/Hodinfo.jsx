import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { toast } from "react-toastify";

const Hodinfo = () => {
  const [courses, setCourses] = useState([]); // Distinct classes
  const [expandedIndex, setExpandedIndex] = useState(null); // Which class is expanded
  const [absentees, setAbsentees] = useState({}); // {index: [absentees]}
  const [loadingAbsentees, setLoadingAbsentees] = useState({}); // {index: boolean}
  const [classesLoading, setClassesLoading] = useState(true);
  const [error, setError] = useState("");

  const authToken = sessionStorage.getItem("authToken");

  if (!authToken) {
    toast.error("Authorization token is missing. Please log in again.", {
      autoClose: 800,
    });
    return null;
  }

  // Fetch distinct classes from backend
  const fetchDistinctClasses = async () => {
    setClassesLoading(true);
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(
        `${backendURL}/api/students/distinct-classes`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.data.success) {
        setCourses(response.data.classes);
        setError("");
      } else {
        setError("Failed to fetch class information");
      }
    } catch (err) {
      setError("Error fetching class information");
      toast.error("Failed to load class information", { autoClose: 800 });
    } finally {
      setClassesLoading(false);
    }
  };

  // Fetch absentees for a class
  const fetchAbsentees = async (course, idx) => {
    setLoadingAbsentees((prev) => ({ ...prev, [idx]: true }));
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(
        `${backendURL}/api/attendance/absentees-by-class`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            yearOfStudy: course.yearOfStudy,
            branch: course.branch,
            section: course.section,
          },
        }
      );
      setAbsentees((prev) => ({
        ...prev,
        [idx]: response.data.absentees || [],
      }));
    } catch (err) {
      setAbsentees((prev) => ({ ...prev, [idx]: [] }));
      toast.error("Failed to fetch absentees", { autoClose: 800 });
    } finally {
      setLoadingAbsentees((prev) => ({ ...prev, [idx]: false }));
    }
  };

  useEffect(() => {
    fetchDistinctClasses();
  }, []);

  const handleExpand = (idx, course) => {
    if (expandedIndex === idx) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(idx);
      if (!absentees[idx]) {
        fetchAbsentees(course, idx);
      }
    }
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gray-50">
      <div className="p-8 w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center text-white">
          HOD Information
        </h1>
        <div className="bg-white rounded-lg divide-y divide-gray-200 shadow">
          {classesLoading ? (
            <div className="p-8 text-lg text-center text-gray-600">
              Loading classes...
            </div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-lg text-center text-gray-600">
              No classes found.
            </div>
          ) : (
            courses.map((course, idx) => (
              <div key={idx}>
                <div
                  className="flex justify-between items-center px-6 py-4 transition cursor-pointer hover:bg-gray-100"
                  onClick={() => handleExpand(idx, course)}
                >
                  <div className="text-lg font-semibold text-gray-800">
                    {course.yearOfStudy} - {course.branch} - {course.section}
                  </div>
                  <div className="ml-4">
                    {expandedIndex === idx ? (
                      <BsChevronUp className="w-6 h-6 text-gray-600" />
                    ) : (
                      <BsChevronDown className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                </div>
                {expandedIndex === idx && (
                  <div className="px-8 pb-6 bg-gray-50">
                    {loadingAbsentees[idx] ? (
                      <div className="py-4 text-center text-gray-500">
                        Loading absentees...
                      </div>
                    ) : absentees[idx] && absentees[idx].length > 0 ? (
                      <div>
                        <h4 className="mb-2 text-lg font-bold text-gray-700">
                          Absentees:
                        </h4>
                        <ul className="pl-6 list-disc text-gray-700">
                          {absentees[idx].map((student, i) => (
                            <li key={i} className="py-1">
                              {student.rollNo} - {student.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-500">
                        No absentees found for this class.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default Hodinfo;
