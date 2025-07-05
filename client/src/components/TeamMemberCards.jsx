import React, { useEffect, useState } from "react";
import axios from "axios";

const TeamMemberCards = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        ); // adjust URL if backend uses prefix
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <section className="main-2">
      {employees.map((member, index) => (
        <div className="person-data" key={index}>
          <div className="background-color"></div>
          <div className="person-1-data">
            <div className="prn-img" width={"100px"} height={"100px"}>
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/employees/${member.profile_pic || "default.png"}`}
                alt="profile"
                className="profile-pic"
                style={{ width: "100px", height: "100px", objectFit: "cover"}}
              />
            </div>
            <div className="prn1-inf">
              <div className="prn1-name">
                <p>{member.full_name}</p>
                <span>{member.email}</span>
              </div>
              <div
                className={`${
                  member.status === "on-leave"
                    ? "on-leave"
                    : member.status === "blocked"
                    ? "blocked"
                    : "active"
                } prn-activity`}
              >
                <p>
                  {member.status === "on-leave"
                    ? "On Leave"
                    : member.status === "blocked"
                    ? "Blocked"
                    : "Active"}
                </p>
              </div>
            </div>
          </div>
          <div className="person-education-inf">
            <div className="edu inf-1">
              <img src="/SVG/prn-data-v1.svg" alt="v1" />
              <p>{member.designation}</p>
            </div>
            <div className="edu inf-2">
              <img src="/SVG/prn-data-v2.svg" alt="v1" />
              <p>{member.department}</p>
            </div>
            <div className="edu inf-3">
              <img src="/SVG/prn-data-v3.svg" alt="v1" />
              <p>{member.phone}</p>
            </div>
          </div>
          <div className="hours-profile">
            <div className="logged-hours">
              <p>Monthly Salary</p>
              <span>
                {member.monthly_salary ? `₹${member.monthly_salary}` : "N/A"}
              </span>
            </div>
            <a
              href={`TeamMemberProfile/${member._id}`}
              className="view-profile"
            >
              View Profile
            </a>
          </div>
        </div>
      ))}
    </section>
  );
};

export default TeamMemberCards;
