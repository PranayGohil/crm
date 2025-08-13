import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [completedCount, setCompletedCount] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
        );
        const proj = projectRes.data.project;
        setProject(proj);

        const subtasksRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`
        );
        setSubTasks(subtasksRes.data || []);
      } catch (err) {
        console.error("Error fetching project details:", err);
        toast.error("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  useEffect(() => {
    setCompletedCount(
      subTasks.filter((t) => t.status?.toLowerCase() === "completed").length
    );
    setProgressPercent(
      subTasks.length ? Math.round((completedCount / subTasks.length) * 100) : 0
    );
  }, [subTasks, completedCount]);

  if (loading) return <LoadingOverlay />;
  if (!project) return <p>Project not found!</p>;

  return (
    <div className="preview-page p-5">
      <section className="pb-sec1 d-flex justify-content-between">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="anp-heading-main">
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
                className="mx-2"
                style={{ scale: "1.3" }}
              />
            </div>
            <div className="head-menu">
              <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
                Project Details{" "}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-sec2">
        <div className="pb-sec2-heading">
          <div className="pb-subtask-head">
            <h2>{project.project_name}</h2>
          </div>
        </div>
      </section>

      <section className="pb-sec-4 pb-sec2">
        <div className="pb-sec4-inner pb-sec3-inner">
          <div className="pb-task-overview-head">
            <p>Project Overview</p>
          </div>
          <div className="pb-task-overview-inner">
            <div className="pb-task-view overview1 row">
              <div className="pb-taskinner row">
                <div className="col-md-4">Start Date:</div>
                <div className="col-md-8">
                  {project.assign_date
                    ? new Date(project.assign_date).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
              <div className="pb-taskinner row">
                <div className="col-md-4">Due Date:</div>
                <div className="col-md-8">
                  {project.due_date
                    ? new Date(project.due_date).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>
            <div className="pb-task-view overview2 row">
              <div className="pb-taskinner">
                <div className="col-md-4">Status:</div>
                <div className="col-md-8">{project.status || "N/A"}</div>
              </div>
              <div className="pb-taskinner">
                <div className="col-md-4">Completion:</div>
                <div className="col-md-8 d-flex flex-column">
                  <div className="md-project-card__subtask_text">
                    <div className="md-subtask-text">Subtasks Completed</div>
                    <div className="md-subtask-total-sub_number">
                      {completedCount}/{subTasks.length}
                    </div>
                  </div>
                  <div className="md-project_card__progress_bar">
                    <div
                      className="md-project_card__progress_fill cdn-bg-color-blue"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-sec-5 pb-sec2">
        <div className="pb-sec5-inner pb-sec3-inner d-flex flex-column">
          <div className="pb-task-overview-head">
            <p>Description</p>
          </div>
          <div className="pb-assigned-employees">
            <div className="pb-task-view overview1">
              <div className="pb-taskinner">
                <p>
                  {project.content[0].description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default ProjectDetails;
