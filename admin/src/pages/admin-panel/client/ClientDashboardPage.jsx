import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const ClientDashboardPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch clients + subtasks from API
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/with-subtasks`
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

  if (loading) return <LoadingOverlay />;

  return (
    <>
      <section className="cd-client_dashboard header">
        <div className="d-flex align-items-center mb-3">
          <div
            className="anp-back-btn"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            style={{ cursor: "pointer" }}
          >
            <img
              src="/SVG/arrow-pc.svg"
              alt="back"
              className="mx-3"
              style={{ scale: "1.3" }}
            />
          </div>
          <div className="head-menu ms-3">
            <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
              Client Dashboard{" "}
            </h1>
          </div>
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
          filteredClients.map((client) => {
            const subtasks = client.subtasks || [];
            const total = subtasks.length;

            const done = subtasks.filter(
              (t) => t.status === "Completed"
            ).length;
            const inProgress = subtasks.filter(
              (t) => t.status === "In Progress"
            ).length;
            const blocked = subtasks.filter(
              (t) => t.status === "Blocked"
            ).length;
            const paused = subtasks.filter((t) => t.status === "Paused").length;
            const todo = subtasks.filter((t) => t.status === "To Do").length;

            const completedPercent =
              total > 0 ? Math.round((done / total) * 100) : 0;

            return (
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
                      Joined:{" "}
                      {client.joining_date
                        ? new Date(client.joining_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="cd-progress_bar">
                  <div className="cd-pr_bar-txt">
                    <p>
                      Total Tasks: <span>{done}</span> / <span>{total}</span>{" "}
                      Completed
                    </p>
                    <span style={{ color: "#10B981" }}>
                      {completedPercent}%
                    </span>
                  </div>
                  <div className="cd-progress_container">
                    <div
                      className="cd-progress"
                      style={{
                        width: `${completedPercent}%`,
                        backgroundColor: "#10B981",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="cd-progress_data">
                  <div className="prog-data cd-inprogress">
                    <p>In Progress</p>
                    <span className="cdn-bg-color-yellow color_yellow flex justify-center items-center rounded-full w-7 h-7">
                      {inProgress}
                    </span>
                  </div>
                  <div className="prog-data cd-done">
                    <p>Completed</p>
                    <span className="cdn-bg-color-green color_green flex justify-center items-center rounded-full w-7 h-7">
                      {done}
                    </span>
                  </div>
                  <div className="prog-data cd-to_do">
                    <p>To Do</p>
                    <span className="cdn-bg-color-blue color_blue flex justify-center items-center rounded-full w-7 h-7">{todo}</span>
                  </div>
                  <div className="prog-data cd-blocked">
                    <p>Blocked</p>
                    <span className="cdn-bg-color-red color_red flex justify-center items-center rounded-full w-7 h-7">
                      {blocked}
                    </span>
                  </div>
                  <div className="prog-data cd-paused">
                    <p>Paused</p>
                    <span className="cdn-bg-color-purple color_purple flex justify-center items-center rounded-full w-7 h-7">
                      {paused}
                    </span>
                  </div>
                </div>

                <div className="cd-view_project">
                  <div className="cd-view_link">
                    <Link to={`/client/projects/${client.username}`}>
                      View Project{" "}
                      <img src="/SVG/cd-arrow-vec.svg" alt="arrow" />
                    </Link>
                  </div>
                  <div className="cd-info_btn">
                    <Link to={`/client/details/${client.username}`}>
                      <img src="/SVG/info-vec.svg" alt="info" /> Info
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </>
  );
};

export default ClientDashboardPage;
