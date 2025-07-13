import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ClientDetailsPage = () => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch client + subtasks
  useEffect(() => {
    const storedUser = localStorage.getItem("clientUser");
    const clientUser = storedUser ? JSON.parse(storedUser) : null;
    console.log("Client ID:", clientUser?._id);
    const fetchClient = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get/${clientUser?._id}`
        );
        // also fetch subtasks for this client
        const subtasksRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/tasks/${res.data._id}`
        );
        const clientData = res.data;
        clientData.subtasks = subtasksRes.data || [];
        setClient(clientData);
      } catch (error) {
        console.error("Failed to fetch client:", error);
        toast.error("Failed to fetch client details");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "1rem" }}>Loading...</p>;
  if (!client)
    return (
      <p style={{ textAlign: "center", marginTop: "1rem" }}>Client not found</p>
    );

  // count subtasks by status
  const subtasks = client.subtasks || [];
  const totalTasks = subtasks.length;

  const completed = subtasks.filter((t) => t.status === "Completed").length;
  const todo = subtasks.filter((t) => t.status === "To Do").length;
  const inProgress = subtasks.filter((t) => t.status === "In Progress").length;
  const paused = subtasks.filter((t) => t.status === "Paused").length;
  const blocked = subtasks.filter((t) => t.status === "Blocked").length;

  const donePercent =
    totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <>
      <section className="cdl-main_main_inner">
        <div className="cdl-main">
          <Link to="/dashboard" className="back_arrow_link mx-3">
            <img src="/SVG/arrow-pc.svg" alt="Back" className="back_arrow" />
          </Link>
          <div className="cdl-main-inner cnc-sec2-inner">
            <h1>{client.full_name}</h1>
            <div className="cnc-active">
              <div className="active-prn-activity">
                <img src="/SVG/dot.svg" alt="dot" />
                <span className="fw-bold text-success">Active</span>
              </div>
              <span>
                Client ID: <span>#{client._id}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mi_24">
        <div className="cdl-sec2">
          <div className="cdl-sec2-inn">
            <div className="cdl-sec2-inner1">
              <div className="cdl-sec2-heading">
                <p>Contact & Identity Information</p>
              </div>
              <div className="cdl-inf-1">
                <div className="cnc-ci">
                  <div className="ci-inner cnc-fullname cnc-css">
                    <span>Username</span>
                    <p>{client.username}</p>
                  </div>
                  <div className="ci-inner cnc-email cnc-css">
                    <span>Email Address</span>
                    <p>{client.email}</p>
                  </div>
                </div>
                <div className="cnc-ci">
                  <div className="ci-inner cnc-phone cnc-css">
                    <span>Phone Number</span>
                    <p>{client.phone}</p>
                  </div>
                  <div className="ci-inner cnc-join-date cnc-css">
                    <span>Joining Date</span>
                    <p>{new Date(client.joining_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="ci-inner cnc-add cnc-css">
                  <span>Address</span>
                  <p>{client.address}</p>
                </div>
                <div className="cdl-email-type cnc-ci">
                  <div className="ci-inner cnc-add cnc-css">
                    <span>Preferred Contact Method</span>
                    <p>Email</p>
                  </div>
                  <div className="ci-inner cnc-add cnc-css">
                    <span>Client Type</span>
                    <div className="cdl-client_type">
                      <span>{client.client_type}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cdl-sec2-inner2">
              <div className="cdl-sec2-heading">
                <p>Company Information</p>
              </div>
              <div className="cdl-inf-1">
                <div className="ci-inner cnc-fullname cnc-css">
                  <span>Company Name</span>
                  <p>{client.company_name || "---"}</p>
                </div>
                <div className="ci-inner cnc-email cnc-css">
                  <span>GST / VAT Number</span>
                  <p>{client.gst_number || "---"}</p>
                </div>
                <div className="ci-inner cnc-phone cnc-css">
                  <span>Website</span>
                  <Link
                    to={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {client.website}
                  </Link>
                </div>
                <div className="ci-inner cnc-join-date cnc-css">
                  <span>LinkedIn</span>
                  <Link
                    to={client.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {client.linkedin}
                  </Link>
                </div>
                <div className="ci-inner cnc-add cnc-css">
                  <span>Additional Notes</span>
                  <p>{client.additional_notes || "---"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mi_24">
        <div className="cdl-sec3">
          <div className="cdl-sec3-inner">
            <div className="cdl-sec3-heading">
              <img src="/SVG/menu-css.svg" alt="menu" />
              <p>Task Summary</p>
            </div>
            <div className="cdl-processbar cd-progress_bar">
              <div className="cd-pr_bar-txt">
                <p>
                  Total Tasks:{" "}
                  <span style={{ color: "#374151" }}>{totalTasks}</span> /{" "}
                  <span style={{ color: "#374151" }}>{completed}</span>{" "}
                  Completed
                </p>
                <span>{donePercent}%</span>
              </div>
              <div className="cd-progress_container">
                <div
                  className="cd-progress"
                  style={{
                    width: `${donePercent}%`,
                    backgroundColor: "#10B981",
                  }}
                ></div>
              </div>
            </div>
            <div className="cdl-task-details">
              <div className="cdl-tasks cdl-task1">
                <p>Total Tasks Assigned</p>
                <span className="task-num">{totalTasks}</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks To Do</p>
                <span className="task-num">{todo}</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks In Progress</p>
                <span className="task-num">{inProgress}</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks Paused</p>
                <span className="task-num">{paused}</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks Blocked</p>
                <span className="task-num">{blocked}</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks Completed</p>
                <span className="task-num">{completed}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ClientDetailsPage;
