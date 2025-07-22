// Designation.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Designation = () => {
  const [designations, setDesignations] = useState([]);
  const [newDesignation, setNewDesignation] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/designation/get-all`);
      setDesignations(res.data.designations);
    } catch (err) {
      console.error("Failed to fetch designations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newDesignation.trim()) return;
    console.log(newDesignation);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/designation/add`, {
        name: newDesignation,
      });
      setDesignations([...designations, res.data]);
      setNewDesignation("");
    } catch (err) {
      console.error("Failed to add designation", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/designation/delete/${id}`);
      setDesignations(designations.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Failed to delete designation", err);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  return (
    <div className="container mt-4">
      <h4>Manage Designations</h4>
      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="New Designation"
          value={newDesignation}
          onChange={(e) => setNewDesignation(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          Add
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="list-group">
          {designations.map((designation) => (
            <li
              key={designation._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {designation.name}
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(designation._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Designation;
