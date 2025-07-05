import React, { useEffect, useState } from "react";
import axios from "axios";

const TeamMembersCount = () => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`);
        setTotal(res.data.length);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <section className="main-3">
      <div className="showing-men">
        <span>
          Showing {total} of {total} team members
        </span>
      </div>
    </section>
  );
};

export default TeamMembersCount;
