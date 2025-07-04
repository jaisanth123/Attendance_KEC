import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { toast } from "react-toastify";
import StudentDetailCard from "./StudentDetailCard";

const Hodinfo = () => {
  const [courses, setCourses] = useState([]); // Distinct classes
  const [expandedIndex, setExpandedIndex] = useState(null); // Which class is expanded
  const [absentees, setAbsentees] = useState({}); // {index: [absentees]}
  const [loadingAbsentees, setLoadingAbsentees] = useState({}); // {index: boolean}
  const [classesLoading, setClassesLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Add date state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailCardOpen, setIsDetailCardOpen] = useState(false);
  const [leaveCounts, setLeaveCounts] = useState({}); // { rollNo: leaveCount }

  const authToken = sessionStorage.getItem("authToken");

  if (!authToken) {
    toast.error("Authorization token is missing. Please log in again.", {
      autoClose: 800,
    });
    return null;
  }

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

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

  // Fetch leave counts for absentees
  const fetchLeaveCounts = async (students, course) => {
    if (!students || students.length === 0) return;
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${backendURL}/api/students/leaves`, {
        params: {
          yearOfStudy: course.yearOfStudy,
          branch: course.branch,
          section: course.section,
          date: date,
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.data && response.data.data) {
        // Map rollNo to leaveCount
        const leaveMap = {};
        response.data.data.forEach((student) => {
          leaveMap[student.rollNo] = student.leaveCount;
        });
        setLeaveCounts((prev) => ({ ...prev, ...leaveMap }));
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  // Fetch absentees for a class using the same endpoint as DutyPage
  const fetchAbsentees = async (course, idx) => {
    setLoadingAbsentees((prev) => ({ ...prev, [idx]: true }));
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;
      const url = `${backendURL}/api/students/remaining?yearOfStudy=${course.yearOfStudy}&branch=${course.branch}&section=${course.section}&date=${date}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const { students, totalStudents } = response.data;
      const formattedDate = formatDate(date);

      if (totalStudents === 0) {
        setAbsentees((prev) => ({
          ...prev,
          [idx]: [],
        }));
        toast.info(
          `No record found for ${course.yearOfStudy} - ${course.branch} - ${course.section}.`,
          {
            autoClose: 800,
          }
        );
        return;
      }

      if (students.length === 0) {
        setAbsentees((prev) => ({
          ...prev,
          [idx]: [],
        }));
        toast.info(
          `For ${course.yearOfStudy} - ${course.branch} - ${course.section}, students attendance for ${formattedDate} has already been marked.`,
          { autoClose: 800 }
        );
        return;
      }

      setAbsentees((prev) => ({
        ...prev,
        [idx]: students.map((student) => ({
          rollNo: student.rollNo,
          name: student.name,
        })),
      }));
      // Fetch leave counts for these absentees
      fetchLeaveCounts(students, course);
    } catch (err) {
      setAbsentees((prev) => ({ ...prev, [idx]: [] }));
      toast.error("Failed to fetch absentees", { autoClose: 800 });
    } finally {
      setLoadingAbsentees((prev) => ({ ...prev, [idx]: false }));
    }
  };

  // Fetch absentee counts for all classes upfront
  const fetchAllAbsenteeCounts = async () => {
    if (!courses || courses.length === 0) return;

    const promises = courses.map(async (course, idx) => {
      try {
        const backendURL = import.meta.env.VITE_BACKEND_URL;
        const url = `${backendURL}/api/students/remaining?yearOfStudy=${course.yearOfStudy}&branch=${course.branch}&section=${course.section}&date=${date}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const { students } = response.data;
        return { idx, students: students || [] };
      } catch (err) {
        return { idx, students: [] };
      }
    });

    try {
      const results = await Promise.all(promises);
      const newAbsentees = {};

      results.forEach(({ idx, students }) => {
        newAbsentees[idx] = students.map((student) => ({
          rollNo: student.rollNo,
          name: student.name,
        }));
      });

      setAbsentees(newAbsentees);
    } catch (err) {
      console.error("Error fetching all absentee counts:", err);
    }
  };

  useEffect(() => {
    fetchDistinctClasses();
  }, []);

  // Fetch all absentee counts when courses are loaded
  useEffect(() => {
    if (courses.length > 0) {
      fetchAllAbsenteeCounts();
    }
  }, [courses, date]);

  // Clear absentees when date changes (will be refetched by above useEffect)
  useEffect(() => {
    setExpandedIndex(null);
  }, [date]);

  const handleExpand = (idx, course) => {
    if (expandedIndex === idx) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(idx);
      // If for some reason data is missing, fetch it
      if (!absentees[idx]) {
        fetchAbsentees(course, idx);
      } else if (absentees[idx].length > 0) {
        // Fetch leave counts for already loaded absentees
        fetchLeaveCounts(absentees[idx], course);
      }
    }
  };

  const handleStudentClick = (student, course) => {
    setSelectedStudent({
      ...student,
      yearOfStudy: course.yearOfStudy,
      branch: course.branch,
      section: course.section,
    });
    setIsDetailCardOpen(true);
  };

  const closeDetailCard = () => {
    setIsDetailCardOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-50">
      {/* Main HOD Information Box */}
      <div className="p-8 mb-6 w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center text-white">
          HOD Information
        </h1>

        {/* Date Selection */}
        <div className="flex justify-center items-center pb-5">
          <div className="w-full max-w-sm">
            <label
              htmlFor="date"
              className="block mb-2 text-lg font-medium text-center text-white"
            >
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Classes Dropdown - Outside the main box */}
      <div className="w-full max-w-6xl">
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
                  <div className="flex gap-3 items-center">
                    {absentees[idx] && (
                      <div className="flex gap-1 items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Count:
                        </span>
                        <span className="text-lg font-semibold text-gray-800">
                          {absentees[idx].length}
                        </span>
                      </div>
                    )}
                    <div>
                      {expandedIndex === idx ? (
                        <BsChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <BsChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
                {expandedIndex === idx && (
                  <div className="px-2 pb-6 sm:px-8">
                    {loadingAbsentees[idx] ? (
                      <div className="py-4 text-center text-gray-500">
                        Loading absentees...
                      </div>
                    ) : absentees[idx] && absentees[idx].length > 0 ? (
                      <div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-3 sm:gap-x-2 sm:gap-y-2 md:grid-cols-4 md:gap-x-2 md:gap-y-2 lg:grid-cols-5 lg:gap-x-2 lg:gap-y-2 xl:grid-cols-6 xl:gap-x-2 xl:gap-y-2 2xl:grid-cols-8 2xl:gap-x-2 2xl:gap-y-2">
                          {absentees[idx].map((student, i) => (
                            <div
                              key={i}
                              onClick={() =>
                                handleStudentClick(student, course)
                              }
                              className="relative flex justify-center items-center p-3 font-semibold text-white bg-red-600 rounded-lg shadow-md transition-all duration-300 transform cursor-pointer hover:scale-105 w-full min-h-[80px]"
                            >
                              <div className="text-center">
                                <div className="text-sm font-bold">
                                  {student.name}
                                </div>
                                <div className="text-sm">{student.rollNo}</div>
                              </div>
                              {typeof leaveCounts[student.rollNo] !==
                                "undefined" && (
                                <span className="absolute bottom-1 right-1 px-2 py-0.5 text-xs font-semibold bg-white text-red-600 rounded-full">
                                  {leaveCounts[student.rollNo]}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
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

      {/* Student Detail Card */}
      <StudentDetailCard
        student={selectedStudent}
        isOpen={isDetailCardOpen}
        onClose={closeDetailCard}
      />
    </div>
  );
};

export default Hodinfo;
