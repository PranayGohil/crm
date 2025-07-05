import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ClientTaskList = ({ searchTerm }) => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`); // your backend route to get clients
        setClients(res.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  return (
    <section className="cd-tech_solution main-2">
      {clients
        .filter(
          (client) =>
            client.full_name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((client, index) => (
          <div className="cd-tech_sol-inner" key={index}>
            <div className="cd-inner_heading">
              <div className="cd-heading-inn">
                <h3>{client.full_name}</h3>
              </div>
              <div className="cd-joining_date">
                <img src="/SVG/calender-vec.svg" alt="calendar" />
                <p>
                  Joined: {new Date(client.joining_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="cd-progress_bar">
              <div className="cd-pr_bar-txt">
                <p>
                  Total Tasks: <span>0</span> / <span>0</span> Completed
                </p>
                <span style={{ color: "#10B981" }}>0%</span>
              </div>
              <div className="cd-progress_container">
                <div
                  className="cd-progress"
                  style={{ width: `0%`, backgroundColor: "#10B981" }}
                ></div>
              </div>
            </div>

            <div className="cd-progress_data">
              {/* Example static stats; you can replace with real stats if available */}
              <div className="prog-data cd-inprogress">
                <p>In Progress</p>
                <span className="cdn-bg-color-yellow color_yellow">0</span>
              </div>
              <div className="prog-data cd-done">
                <p>Done</p>
                <span className="cdn-bg-color-green color_green">0</span>
              </div>
              <div className="prog-data cd-to_do">
                <p>To do</p>
                <span className="cdn-bg-color-blue color_blue">0</span>
              </div>
              <div className="prog-data cd-blocked">
                <p>Blocked</p>
                <span className="cdn-bg-color-red color_red">0</span>
              </div>
              <div className="prog-data cd-in-review">
                <p>In Review</p>
                <span className="cdn-bg-color-purple color_purple">0</span>
              </div>
            </div>

            <div className="cd-view_project">
              <div className="cd-view_link">
                <a href="ClientProjectDetails">
                  View Project <img src="/SVG/cd-arrow-vec.svg" alt="arrow" />
                </a>
              </div>
              <div className="cd-info_btn">
                <Link to={`/clientdetailspage/${client.username}`}>
                  <img src="/SVG/info-vec.svg" alt="info" /> Info
                </Link>
              </div>
            </div>
          </div>
        ))}
    </section>
  );
};

export default ClientTaskList;
