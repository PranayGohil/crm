import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ClientDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get-all`
        );
        setClients(res.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Failed to fetch clients.");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <section className="cd-client_dashboard header">
        <div className="cd-head-menu head-menu">
          <h1>Client Dashboard</h1>
          <p>Manage your clients and monitor their task progress</p>
        </div>

        <div className="cd-nav-bar nav-bar">
          <div className="cd-nav-search nav-search">
            <div className="cd-searchbar searchbar">
              <div className="cd-input-type input-type">
                <div className="cd-img-search-input img-search-input">
                  <img src="/SVG/search-icon.svg" alt="search" />
                </div>
                <div className="cd-input-type-txt input-type-txt">
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    style={{ border: "none" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="cd-add-mbr add-mbr">
              <div className="cd-client_dashboard plus-icon">
                <Link to="/client/create" className="cd-plus-icon">
                  <img src="/SVG/plus.svg" alt="add" />
                  <span>Add Client</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="main-1">
        <div className="member-inf">
          <div className="inf-sec-1 inf-sec">
            <div className="name1">
              <p>Total Clients</p>
              <span>{clients.length}</span>
            </div>
            <div className="inf-icon">
              <img src="/SVG/icon-1.svg" alt="icon-1" />
            </div>
          </div>
        </div>
      </section>

      <section className="cd-tech_solution main-2">
        {loading ? (
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Loading clients...
          </p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "red", marginTop: "1rem" }}>
            {error}
          </p>
        ) : filteredClients.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            No clients found.
          </p>
        ) : (
          filteredClients.map((client) => (
            <div
              className="cd-tech_sol-inner"
              key={client._id || client.username}
            >
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
                  <Link to="ClientProjectDetails">
                    View Project <img src="/SVG/cd-arrow-vec.svg" alt="arrow" />
                  </Link>
                </div>
                <div className="cd-info_btn">
                  <Link to={`/client/details/${client.username}`}>
                    <img src="/SVG/info-vec.svg" alt="info" /> Info
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
};

export default ClientDashboardPage;
