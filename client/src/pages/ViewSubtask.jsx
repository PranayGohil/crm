import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../components/LoadingOverlay";
import { toast } from "react-toastify";
import { statusOptions, priorityOptions } from "../options";

const ViewSubtask = () => {
  const { subtaskId } = useParams();
  const navigate = useNavigate();

  const [subtask, setSubtask] = useState(null);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: subtaskData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`
        );
        setSubtask(subtaskData);

        const items = (subtaskData.media_files || []).map((file) => ({
          src: `${file}`,
          alt: file,
        }));
        setMediaItems(items);
        console.log("Subtask Data:", subtaskData);

        const { data: projectData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${subtaskData.project_id}`
        );
        setProject(projectData.project);
        console.log("Project Data:", projectData);

        if (projectData.project.client_id) {
          const { data: clientData } = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/client/get/${projectData.project.client_id}`
          );
          setClient(clientData);
          console.log("Client Data:", clientData);
        }
      } catch (error) {
        console.error("Failed to load subtask details:", error);
        toast.error("Failed to load subtask details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subtaskId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (loading) return <LoadingOverlay />;
  if (!subtask) return <p>Subtask not found!</p>;

  return (
    <div className="preview-page">
      <section className="pb-sec1">
        <div className="pb-sec1-inner">
          <a onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
            <img src="/SVG/arrow-pc.svg" alt="arrow-pc" />
          </a>
          <span>Back</span>
        </div>
      </section>

      <section className="pb-sec2">
        <div className="pb-sec2-heading">
          <div className="pb-subtask-head">
            <h2>{project?.project_name || "Project Name"}</h2>
            <p>{subtask.task_name || "Subtask Name"}</p>
          </div>
        </div>
      </section>

      <section className="pb-sec-3 pb-sec2">
        <div className="pb-sec3-inner">
          <div className="pb-client-id">
            <div className="pb-pro-client pb-project-id">
              <p>Project ID: </p>
              <span>{project?._id}</span>
            </div>
            <div className="pb-pro-client pb-client">
              <p>Client: </p>
              <span>{client?.full_name || "N/A"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-sec-4 pb-sec2">
        <div className="pb-sec4-inner pb-sec3-inner">
          <div className="pb-task-overview-head">
            <p>Task Overview</p>
          </div>
          <div className="pb-task-overview-inner">
            <div className="pb-task-view overview1">
              <div className="pb-taskinner">
                <p>Stage:</p>
                <span>{subtask.stage || "N/A"}</span>
              </div>
              <div className="pb-taskinner">
                <p>Start Date:</p>
                <span>
                  {subtask.assign_date
                    ? formatDate(subtask.assign_date)
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="pb-task-view overview2">
              <div className="pb-taskinner">
                <p>Created By:</p>
                <span>{client?.full_name || "N/A"}</span>
              </div>
              <div className="pb-taskinner">
                <p>Status:</p>
                <span>{subtask.status || "N/A"}</span>
              </div>
              <div className="pb-taskinner">
                <p>Due Date:</p>
                <span>
                  {subtask.due_date ? formatDate(subtask.due_date) : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-sec-5 pb-sec2">
        <div className="pb-sec5-inner pb-sec3-inner">
          <div className="pb-project-description">
            <h3>Description</h3>
            <p>{subtask.description || "No description available."}</p>
          </div>
        </div>
      </section>

      <section className="pb-sec-6 pb-sec2">
        <div className="pb-sec6-inner pb-sec3-inner">
          <h1>Attached Media</h1>
          <div className="pb-attached-photo-sec">
            <div className="pb-project-gallary">
              {mediaItems.length === 0 ? (
                <p>No media attached.</p>
              ) : (
                mediaItems.map((item, index) => (
                  <div className="pb-gallary-img" key={index}>
                    <img
                      src={item.src}
                      alt={item.alt}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="pb-gall-icons">
                      <a
                        href={item.src}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="pb-media-icon">
                          <img src="/SVG/css-eye.svg" alt="view" />
                        </div>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewSubtask;
