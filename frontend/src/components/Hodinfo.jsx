import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
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
  const [attendanceStatus, setAttendanceStatus] = useState({}); // { index: "marked" | "not_marked" }
  const [loadedClasses, setLoadedClasses] = useState(new Set()); // Track which classes have been loaded
  const [leaveCountsLoaded, setLeaveCountsLoaded] = useState(new Set()); // Track which classes have leave counts loaded
  const [initialDataLoading, setInitialDataLoading] = useState(false); // Loading state for initial data fetch

  const authToken = sessionStorage.getItem("authToken");

  if (!authToken) {
    return null;
  }

  // Memoized backend URL
  const backendURL = useMemo(() => import.meta.env.VITE_BACKEND_URL, []);

  // Memoized axios instance with auth header
  const apiClient = useMemo(() => {
    return axios.create({
      baseURL: backendURL,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }, [backendURL, authToken]);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Optimized: Fetch distinct classes from backend
  const fetchDistinctClasses = useCallback(async () => {
    setClassesLoading(true);
    try {
      const response = await apiClient.get("/api/students/distinct-classes");

      if (response.data.success) {
        setCourses(response.data.classes);
        setError("");
      } else {
        setError("Failed to fetch class information");
      }
    } catch (err) {
      setError("Error fetching class information");
    } finally {
      setClassesLoading(false);
    }
  }, [apiClient]);

  // Optimized: Batch fetch leave counts for multiple classes
  const fetchLeaveCountsBatch = useCallback(
    async (classes) => {
      if (!classes || classes.length === 0) return;

      try {
        // Use the new batch endpoint
        const response = await apiClient.post("/api/students/batch-leaves", {
          classes: classes,
          date: date,
        });

        if (response.data && response.data.success) {
          const newLeaveCounts = response.data.leaveCounts;
          setLeaveCounts((prev) => ({ ...prev, ...newLeaveCounts }));

          // Mark these classes as having leave counts loaded
          const classKeys = classes.map(
            (course) =>
              `${course.yearOfStudy}-${course.branch}-${course.section}`
          );
          setLeaveCountsLoaded((prev) => new Set([...prev, ...classKeys]));
        }
      } catch (err) {
        console.error("Error fetching batch leave counts:", err);
        // Fallback to individual requests if batch endpoint fails
        try {
          const promises = classes.map((course) =>
            apiClient.get("/api/students/leaves", {
              params: {
                yearOfStudy: course.yearOfStudy,
                branch: course.branch,
                section: course.section,
                date: date,
              },
            })
          );

          const responses = await Promise.all(promises);
          const newLeaveCounts = {};

          responses.forEach((response, index) => {
            if (response.data && response.data.data) {
              response.data.data.forEach((student) => {
                newLeaveCounts[student.rollNo] = student.leaveCount;
              });
            }
          });

          setLeaveCounts((prev) => ({ ...prev, ...newLeaveCounts }));

          // Mark these classes as having leave counts loaded
          const classKeys = classes.map(
            (course) =>
              `${course.yearOfStudy}-${course.branch}-${course.section}`
          );
          setLeaveCountsLoaded((prev) => new Set([...prev, ...classKeys]));
        } catch (fallbackErr) {
          console.error("Fallback leave counts also failed:", fallbackErr);
        }
      }
    },
    [apiClient, date]
  );

  // Optimized: Single API call to get attendance data for a class
  const fetchAttendanceData = useCallback(
    async (course, idx) => {
      if (loadedClasses.has(idx)) return; // Skip if already loaded

      setLoadingAbsentees((prev) => ({ ...prev, [idx]: true }));

      try {
        // Single API call to get both attendance status and absent students
        const response = await apiClient.get(
          "/api/attendance/getAttendanceWithAbsentees",
          {
            params: {
              yearOfStudy: course.yearOfStudy,
              branch: course.branch,
              section: course.section,
              date: date,
            },
          }
        );

        const {
          attendanceStatus: status,
          absentStudents,
          absentCount,
          otherStatusCount,
        } = response.data;

        if (
          status === "not_marked" ||
          absentCount === "N/A" ||
          otherStatusCount === "N/A"
        ) {
          setAbsentees((prev) => ({ ...prev, [idx]: [] }));
          setAttendanceStatus((prev) => ({ ...prev, [idx]: "not_marked" }));
        } else {
          setAbsentees((prev) => ({
            ...prev,
            [idx]: absentStudents || [],
          }));
          setAttendanceStatus((prev) => ({ ...prev, [idx]: "marked" }));

          // Fetch leave counts for absent students if any
          if (absentStudents && absentStudents.length > 0) {
            fetchLeaveCountsBatch([course]);
          }
        }

        setLoadedClasses((prev) => new Set([...prev, idx]));
      } catch (err) {
        // Fallback to original method if new endpoint doesn't exist
        try {
          // Check attendance status
          const statusResponse = await apiClient.get(
            "/api/attendance/getAttendanceStatusCount",
            {
              params: {
                yearOfStudy: course.yearOfStudy,
                branch: course.branch,
                section: course.section,
                date: date,
              },
            }
          );

          const { absentCount, otherStatusCount } = statusResponse.data;

          if (absentCount === "N/A" || otherStatusCount === "N/A") {
            setAbsentees((prev) => ({ ...prev, [idx]: [] }));
            setAttendanceStatus((prev) => ({ ...prev, [idx]: "not_marked" }));
          } else {
            // Get absent students
            const absentResponse = await apiClient.get(
              "/api/students/remaining",
              {
                params: {
                  yearOfStudy: course.yearOfStudy,
                  branch: course.branch,
                  section: course.section,
                  date: date,
                },
              }
            );

            const { students } = absentResponse.data;
            setAbsentees((prev) => ({ ...prev, [idx]: students || [] }));
            setAttendanceStatus((prev) => ({ ...prev, [idx]: "marked" }));

            if (students && students.length > 0) {
              fetchLeaveCountsBatch([course]);
            }
          }
        } catch (fallbackErr) {
          setAbsentees((prev) => ({ ...prev, [idx]: [] }));
          setAttendanceStatus((prev) => ({ ...prev, [idx]: "not_marked" }));
        }
      } finally {
        setLoadingAbsentees((prev) => ({ ...prev, [idx]: false }));
      }
    },
    [apiClient, date, loadedClasses, fetchLeaveCountsBatch]
  );

  // Optimized: Fetch all attendance data for all classes upfront
  const fetchAllAttendanceData = useCallback(async () => {
    if (!courses || courses.length === 0) return;

    console.log("Fetching attendance data for all classes...");
    setInitialDataLoading(true);

    // Create promises for all classes using the optimized endpoint
    const promises = courses.map(async (course, idx) => {
      try {
        // Use the optimized single API call
        const response = await apiClient.get(
          "/api/attendance/getAttendanceWithAbsentees",
          {
            params: {
              yearOfStudy: course.yearOfStudy,
              branch: course.branch,
              section: course.section,
              date: date,
            },
          }
        );

        const {
          attendanceStatus: status,
          absentStudents,
          absentCount,
          otherStatusCount,
        } = response.data;

        return {
          idx,
          students: absentStudents || [],
          status: status || "not_marked",
          course,
        };
      } catch (err) {
        console.error(`Error fetching data for class ${idx}:`, err);
        // Fallback to original method if new endpoint doesn't exist
        try {
          const statusResponse = await apiClient.get(
            "/api/attendance/getAttendanceStatusCount",
            {
              params: {
                yearOfStudy: course.yearOfStudy,
                branch: course.branch,
                section: course.section,
                date: date,
              },
            }
          );

          const { absentCount, otherStatusCount } = statusResponse.data;

          if (absentCount === "N/A" || otherStatusCount === "N/A") {
            return { idx, students: [], status: "not_marked", course };
          }

          const absentResponse = await apiClient.get(
            "/api/students/remaining",
            {
              params: {
                yearOfStudy: course.yearOfStudy,
                branch: course.branch,
                section: course.section,
                date: date,
              },
            }
          );

          const { students } = absentResponse.data;
          return { idx, students: students || [], status: "marked", course };
        } catch (fallbackErr) {
          console.error(`Fallback also failed for class ${idx}:`, fallbackErr);
          return { idx, students: [], status: "not_marked", course };
        }
      }
    });

    try {
      const results = await Promise.all(promises);
      const newAbsentees = {};
      const newAttendanceStatus = {};
      const classesWithAbsentees = [];

      results.forEach(({ idx, students, status, course }) => {
        newAbsentees[idx] = students.map((student) => ({
          rollNo: student.rollNo,
          name: student.name,
        }));
        newAttendanceStatus[idx] = status;

        // Track classes that have absentees for leave count fetching
        if (students && students.length > 0) {
          classesWithAbsentees.push(course);
        }
      });

      setAbsentees(newAbsentees);
      setAttendanceStatus(newAttendanceStatus);
      setLoadedClasses(new Set(courses.map((_, idx) => idx)));

      // Batch fetch leave counts for all classes with absentees
      if (classesWithAbsentees.length > 0) {
        fetchLeaveCountsBatch(classesWithAbsentees);
      }

      console.log("Successfully fetched attendance data for all classes");
    } catch (err) {
      console.error("Error fetching all attendance data:", err);
    } finally {
      setInitialDataLoading(false);
    }
  }, [apiClient, date, courses, fetchLeaveCountsBatch]);

  // Optimized: Lazy load attendance data only when needed (now used as fallback)
  const handleExpand = useCallback(
    (idx, course) => {
      if (expandedIndex === idx) {
        setExpandedIndex(null);
      } else {
        setExpandedIndex(idx);

        // Only fetch data if not already loaded (fallback for edge cases)
        if (!loadedClasses.has(idx)) {
          fetchAttendanceData(course, idx);
        } else if (absentees[idx] && absentees[idx].length > 0) {
          // Check if leave counts need to be loaded
          const classKey = `${course.yearOfStudy}-${course.branch}-${course.section}`;
          if (!leaveCountsLoaded.has(classKey)) {
            fetchLeaveCountsBatch([course]);
          }
        }
      }
    },
    [
      expandedIndex,
      loadedClasses,
      absentees,
      leaveCountsLoaded,
      fetchAttendanceData,
      fetchLeaveCountsBatch,
    ]
  );

  const handleStudentClick = useCallback((student, course) => {
    setSelectedStudent({
      ...student,
      yearOfStudy: course.yearOfStudy,
      branch: course.branch,
      section: course.section,
    });
    setIsDetailCardOpen(true);
  }, []);

  const closeDetailCard = useCallback(() => {
    setIsDetailCardOpen(false);
    setSelectedStudent(null);
  }, []);

  // Clear cache when date changes
  useEffect(() => {
    setExpandedIndex(null);
    setLoadedClasses(new Set());
    setLeaveCountsLoaded(new Set());
    setAbsentees({});
    setAttendanceStatus({});
    setLeaveCounts({});
  }, [date]);

  // Fetch classes on mount
  useEffect(() => {
    fetchDistinctClasses();
  }, [fetchDistinctClasses]);

  // Fetch all attendance data when courses are loaded or date changes
  useEffect(() => {
    if (courses.length > 0) {
      fetchAllAttendanceData();
    }
  }, [courses, date, fetchAllAttendanceData]);

  // Memoized class rendering to prevent unnecessary re-renders
  const renderClasses = useMemo(() => {
    if (classesLoading) {
      return (
        <div className="p-8 text-lg text-center text-gray-600">
          Loading classes...
        </div>
      );
    }

    if (courses.length === 0) {
      return (
        <div className="p-8 text-lg text-center text-gray-600">
          No classes found.
        </div>
      );
    }

    // Show loading state while fetching initial attendance data
    if (initialDataLoading) {
      return (
        <div className="p-8 text-lg text-center text-gray-600">
          Loading attendance data for all classes...
        </div>
      );
    }

    return courses.map((course, idx) => (
      <div key={idx}>
        <div
          className="flex justify-between items-center px-6 py-4 transition cursor-pointer hover:bg-gray-100"
          onClick={() => handleExpand(idx, course)}
        >
          <div className="text-lg font-semibold text-gray-800">
            {course.yearOfStudy} - {course.branch} - {course.section}
          </div>
          <div className="flex gap-3 items-center">
            {attendanceStatus[idx] === "not_marked" ? (
              <div className="text-lg font-semibold text-red-500">
                Not Marked
              </div>
            ) : (
              absentees[idx] && (
                <div className="flex gap-1 items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Count:
                  </span>
                  <span className="text-lg font-semibold text-gray-800">
                    {absentees[idx].length}
                  </span>
                </div>
              )
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
            ) : attendanceStatus[idx] === "not_marked" ? (
              <div className="py-4 font-semibold text-center text-red-500">
                Attendance not marked for this class.
              </div>
            ) : absentees[idx] && absentees[idx].length > 0 ? (
              <div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-3 sm:gap-x-2 sm:gap-y-2 md:grid-cols-4 md:gap-x-2 md:gap-y-2 lg:grid-cols-5 lg:gap-x-2 lg:gap-y-2 xl:grid-cols-6 xl:gap-x-2 xl:gap-y-2 2xl:grid-cols-8 2xl:gap-x-2 2xl:gap-y-2">
                  {absentees[idx].map((student, i) => (
                    <div
                      key={i}
                      onClick={() => handleStudentClick(student, course)}
                      className={`relative flex justify-center items-center p-3 font-semibold text-white rounded-lg shadow-md transition-all duration-300 transform cursor-pointer hover:scale-105 w-full min-h-[80px] ${
                        typeof leaveCounts[student.rollNo] !== "undefined"
                          ? leaveCounts[student.rollNo] >= 4
                            ? "bg-red-600 hover:bg-red-700"
                            : leaveCounts[student.rollNo] >= 2
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">{student.name}</div>
                        <div className="text-lg">{student.rollNo}</div>
                      </div>
                      {typeof leaveCounts[student.rollNo] !== "undefined" && (
                        <span
                          className={`absolute bottom-1 right-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                            leaveCounts[student.rollNo] >= 4
                              ? "bg-white text-red-600"
                              : leaveCounts[student.rollNo] >= 2
                              ? "bg-white text-yellow-600"
                              : "bg-white text-green-600"
                          }`}
                        >
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
    ));
  }, [
    classesLoading,
    courses,
    expandedIndex,
    attendanceStatus,
    absentees,
    loadingAbsentees,
    leaveCounts,
    initialDataLoading,
    handleExpand,
    handleStudentClick,
  ]);

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-50">
      {/* Main HOD Information Box */}
      <div className="p-8 mb-6 w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center text-white">
          Dashboard
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
          {renderClasses}
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
