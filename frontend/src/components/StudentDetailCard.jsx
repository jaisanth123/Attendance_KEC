import React from "react";
import { IoClose } from "react-icons/io5";

const StudentDetailCard = ({ student, isOpen, onClose }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div className="relative p-8 w-96 bg-white rounded-lg shadow-2xl transition-all duration-500 transform scale-110 animate-slideDown">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 rounded-full transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
        >
          <IoClose className="w-6 h-6" />
        </button>

        {/* Student Details */}
        <div className="text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
          </div>

          <div className="space-y-4 text-left">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="mb-2 text-lg font-semibold text-gray-700">
                Student Information
              </h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Roll Number:</span>
                  <span>{student.rollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="px-2 py-1 text-sm font-medium text-white bg-red-600 rounded-full">
                    Absent
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="mb-2 text-lg font-semibold text-gray-700">
                Class Information
              </h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Year:</span>
                  <span>{student.yearOfStudy || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Branch:</span>
                  <span>{student.branch || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Section:</span>
                  <span>{student.section || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 w-full text-gray-600 bg-gray-200 rounded-lg transition-colors duration-200 hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailCard;
