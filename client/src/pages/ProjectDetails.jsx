import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [subTasks, setSubTasks] = useState([]); // optional
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch project
        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
        );
        const proj = projectRes.data.project;
        setProject(proj);

        // 2. Fetch client
        if (proj.client_id) {
          const clientRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/client/get/${proj.client_id}`
          );
          setClient(clientRes.data.client);
        }

        // 3. Fetch assigned employees
        if (proj.asign_to && proj.asign_to.length > 0) {
          const employeeIds = proj.asign_to.map((a) => a.id);
          const employeesRes = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/employee/get-multiple`,
            { ids: employeeIds }
          );
          setAssignedEmployees(employeesRes.data.employees);
        }

        // 4. (Optional) Fetch subtasks
        const subtasksRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`
        );
        setSubTasks(subtasksRes.data.subtasks || []);
      } catch (err) {
        console.error("Error fetching project details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found!</p>;

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
            <h2>{project.project_name}</h2>
            <p>{subTasks.length > 0 ? subTasks[0].task_name : "No Subtask"}</p>
          </div>
        </div>
      </section>

      <section className="pb-sec-3 pb-sec2">
        <div className="pb-sec3-inner">
          <div className="pb-client-id">
            <div className="pb-pro-client pb-project-id">
              <p>Project ID: </p>
              <span>{project._id}</span>
            </div>
            <div className="pb-pro-client pb-client">
              <p>Client: </p>
              <span>{client?.full_name || "N/A"}</span>
            </div>
          </div>
          <div className="pb-subtask-process">
            <a href="#" className="cdn-bg-color-yellow color_yellow">
              {project.status || "Status Unknown"}
            </a>
            <a href="#" className="cdn-bg-color-red color_red">
              {project.priority || "Priority Unknown"}
            </a>
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
                <span>{subTasks.length > 0 ? subTasks[0].stage : "N/A"}</span>
              </div>
              <div className="pb-taskinner">
                <p>Assigned To:</p>
                <span>
                  {assignedEmployees.map((e) => e.full_name).join(", ") ||
                    "N/A"}
                </span>
              </div>
              <div className="pb-taskinner">
                <p>Start Date:</p>
                <span>
                  {project.assign_date
                    ? new Date(project.assign_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="pb-taskinner">
                <p>Due Date:</p>
                <span>
                  {project.due_date
                    ? new Date(project.due_date).toLocaleDateString()
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
                <span>{project.status || "N/A"}</span>
              </div>
              <div className="pb-taskinner">
                <p>Completion:</p>
                <span className="pb-process-span">
                  <div className="cd-progress_container">
                    <div
                      className="cd-progress"
                      style={{ width: "83%", backgroundColor: "#10B981" }}
                    ></div>
                  </div>
                  83%
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
            <p>{subTasks[0]?.description || "No description available."}</p>
          </div>
        </div>
      </section>

      {/* Keep your media, comments, buttons sections same for now */}
    </div>
  );
};

export default ProjectDetails;
