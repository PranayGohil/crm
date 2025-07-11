import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get-username/${id}`
        );
        setClient(res.data);
      } catch (error) {
        console.error("Failed to fetch client:", error);
        toast.error("Failed to fetch client details");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  // Delete client handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/client/delete/${client._id}`
      );
      toast.success("Client deleted successfully!");
      navigate("/client-dashboard");
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Failed to delete client");
    }
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "1rem" }}>Loading...</p>;
  if (!client)
    return (
      <p style={{ textAlign: "center", marginTop: "1rem" }}>Client not found</p>
    );

  return (
    <>
      <section className="cdl-main_main_inner">
        <div className="cdl-main">
          <Link to="/client/dashboard" className="back_arrow_link mx-3">
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
          <div className="edit-profile">
            <a href={`/client/edit/${client.username}`}>
              <img src="/SVG/edit-white.svg" alt="edit" />
              Edit
            </a>
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
                    <p>Email</p> {/* Replace if dynamic */}
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
                  Total Tasks: <span style={{ color: "#374151" }}>12</span> /{" "}
                  <span style={{ color: "#374151" }}>10</span> Done
                </p>
                <span>83%</span>
              </div>
              <div className="cd-progress_container">
                <div
                  className="cd-progress"
                  style={{ width: "83%", backgroundColor: "#10B981" }}
                ></div>
              </div>
            </div>
            <div className="cdl-task-details">
              {/* Replace with dynamic if needed */}
              <div className="cdl-tasks cdl-task1">
                <p>Total Tasks Assigned</p>
                <span className="task-num">10</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks To Do</p>
                <span className="task-num">3</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks In Progress</p>
                <span className="task-num">8</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks Paused</p>
                <span className="task-num">3</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks Blocked</p>
                <span className="task-num">3</span>
              </div>
              <div className="cdl-tasks cdl-task1">
                <p>Tasks Done</p>
                <span className="task-num">6</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cdl-btns-sec">
        <div className="cdl-final-btns">
          <div className="css-delete_btn">
            <button
              onClick={handleDelete}
              className="css-high css-delete border-0"
            >
              <img src="/SVG/delete-vec.svg" alt="del" />
              Delete Client
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ClientDetailsPage;
