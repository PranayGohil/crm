// Department.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Department = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/department/get-all`
      );
      setDepartments(res.data.departments);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newDepartment.trim()) return;
    console.log(newDepartment);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/department/add`,
        {
          name: newDepartment,
        }
      );
      setDepartments([...departments, res.data]);
      setNewDepartment("");
    } catch (err) {
      console.error("Failed to add department", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/department/delete/${id}`
      );
      setDepartments(departments.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Failed to delete department", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-lg mr-4 hover:bg-gray-200 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Manage Departments
            </h1>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4 bg-white rounded shadow">
        <div className="d-flex gap-2 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="New Department"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAdd}>
            Add
          </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="list-group">
            {departments.map((department) => (
              <li
                key={department._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {department.name}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(department._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Department;
