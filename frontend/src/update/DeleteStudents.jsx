import React, { useState } from 'react';

function DeleteStudents() {
  const [isBulkMode, setIsBulkMode] = useState(true);
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [message, setMessage] = useState('');

  const apiBase = 'http://localhost:5000';

  const handleBulkDelete = async () => {
    if (!yearOfStudy || !branch || !section) {
      return setMessage('All fields are required for bulk delete.');
    }

    try {
      const res = await fetch(`${apiBase}/api/delete-students/students`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yearOfStudy, branch, section }),
      });
      const text = await res.text();
      setMessage(text);
    } catch (err) {
      setMessage('Bulk delete failed.');
    }
  };

  const handleSingleDelete = async () => {
    if (!rollNo) {
      return setMessage('Roll No is required for single delete.');
    }

    try {
      const res = await fetch(`${apiBase}/api/delete-students/student/${rollNo}`, {
        method: 'DELETE',
      });
      const text = await res.text();
      setMessage(text);
    } catch (err) {
      setMessage('Single delete failed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-2">
        {isBulkMode ? 'Bulk Delete' : 'Delete by Roll No'}
      </h1>

      {/* Toggle Button */}
      <button
        onClick={() => {
          setIsBulkMode(!isBulkMode);
          setMessage('');
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Switch to {isBulkMode ? 'Single Delete' : 'Bulk Delete'}
      </button>

      {/* Bulk Delete Mode */}
      {isBulkMode ? (
        <div className="space-y-2 w-80">
          <input
            className="w-full p-2 border border-black rounded"
            type="text"
            placeholder="Year of Study"
            value={yearOfStudy}
            onChange={(e) => setYearOfStudy(e.target.value)}
          />
          <input
            className="w-full p-2 border border-black rounded"
            type="text"
            placeholder="Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
          <input
            className="w-full p-2 border border-black rounded"
            type="text"
            placeholder="Section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />

          <button
            onClick={handleBulkDelete}
            disabled={!yearOfStudy || !branch || !section}
            className={`w-full py-2 text-white rounded ${
              !yearOfStudy || !branch || !section
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Delete Students
          </button>
        </div>
      ) : (
        // Single Delete Mode
        <div className="space-y-2 w-80">
          <input
            className="w-full p-2 border border-black rounded"
            type="text"
            placeholder="Roll No"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
          />
          <button
            onClick={handleSingleDelete}
            disabled={!rollNo}
            className={`w-full py-2 text-white rounded ${
              !rollNo ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Delete Student
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}

export default DeleteStudents;
