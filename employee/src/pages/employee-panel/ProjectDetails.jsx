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

  const mediaItems = [
    { src: "/Image/jwell1.png", alt: "g-i1" },
    { src: "/Image/jwell2.png", alt: "g-i2" },
    { src: "/Image/jwell1.png", alt: "g-i1" },
    { src: "/Image/jwell3.png", alt: "g-i2" },
  ];

  const comments = [
    {
      id: 1,
      name: "Emma Davis",
      role: "Project Manager",
      timeAgo: "2 days ago",
      text: "Please make sure to include the smaller diamond details as specified in the client brief. They want exactly 16 stones in the halo setting.",
      avatar: "/Image/prn1.png",
    },
    {
      id: 2,
      name: "Emma Davis",
      role: "Project Manager",
      timeAgo: "2 days ago",
      text: "Please make sure to include the smaller diamond details as specified in the client brief. They want exactly 16 stones in the halo setting.",
      avatar: "/Image/prn1.png",
    },
    {
      id: 3,
      name: "Emma Davis",
      role: "Project Manager",
      timeAgo: "2 days ago",
      text: "Please make sure to include the smaller diamond details as specified in the client brief. They want exactly 16 stones in the halo setting.",
      avatar: "/Image/prn1.png",
    },
  ];

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
        if (proj.assign_to && proj.assign_to.length > 0) {
          const employeeIds = proj.assign_to.map((a) => a.id);
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

      <section className="pb-sec-6 pb-sec2">
        <div className="pb-sec6-inner pb-sec3-inner">
          <h1>Attached Media</h1>
          <div className="pb-attached-photo-sec">
            <div className="pb-project-gallary">
              {mediaItems.map((item, index) => (
                <div className="pb-gallary-img" key={index}>
                  <img src={item.src} alt={item.alt} />
                  <div className="pb-gall-icons">
                    <a href="#">
                      <div className="pb-media-icon">
                        <img src="/SVG/css-eye.svg" alt="view" />
                      </div>
                    </a>
                    <a href="#">
                      <div className="pb-media-icon">
                        <img src="/SVG/download-photo.svg" alt="download" />
                      </div>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pb-add-img">
            <img src="/SVG/plus-grey.svg" alt="add" />
            <span>Add Media</span>
          </div>
        </div>
      </section>

      <section className="pb-sec-7 pb-sec2">
        <div className="pb-sec7-inner pb-sec3-inner">
          <div className="pb-sec7-heading">
            <h1>Comments</h1>
            <p>
              <span style={{ paddingRight: "4px" }}>{comments.length}</span>
              comments
            </p>
          </div>

          <div className="pb-comment-sec">
            {comments.map((comment) => (
              <div className="pb-client-comment" key={comment.id}>
                <img src={comment.avatar} alt={comment.name} />
                <div className="pb-comment-description">
                  <div className="pb-comment-cilent-name">
                    <div className="pb-name-time">
                      <div className="pb-cilent-name">
                        <h4>{comment.name}</h4>
                        <span>{comment.role}</span>
                      </div>
                      <p>
                        <span style={{ paddingRight: "6px" }}>
                          {comment.timeAgo}
                        </span>
                      </p>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                  <div className="pb-comments-btns">
                    <a href="#">Reply</a>
                    <a href="#">Like</a>
                  </div>
                </div>
              </div>
            ))}

            <div className="pb-add-post-comment">
              <div className="pb-add-comment">
                <img src="/Image/Riya Sharma.png" alt="Riya Sharma" />
                <div className="pb-type-comment">
                  <input type="text" placeholder="Write a comment..." />
                </div>
              </div>
              <div className="pb-add-components">
                <div className="pb-add-imgs">
                  <a href="#">
                    <img src="/SVG/add-photo.svg" alt="Add Photo" />
                  </a>
                  <a href="#">
                    <img src="/SVG/add-emoji.svg" alt="Add Emoji" />
                  </a>
                  <a href="#">
                    <img src="/SVG/mention.svg" alt="Mention" />
                  </a>
                </div>
                <div className="add-mbr">
                  <div className="plus-icon">
                    <a href="#">
                      <span>Post Comment</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-sec-8 pb-sec2">
        <div className="pb-sec8-inner pb-sec3-inner">
          <div className="pb-btns pb-edit-delete">
            <div className="edit-profile">
              <a href="#">
                <img src="/SVG/edit.svg" alt="edit" />
                Edit
              </a>
            </div>
            <div className="css-delete_btn">
              <a href="#" className="css-high css-delete">
                <img src="/SVG/delete-vec.svg" alt="del" />
                Delete Selected
              </a>
            </div>
          </div>
          <div className="pb-btns add-mbr">
            <div className="cnc-btn sms-reset-btn">
              <a href="#">Back to Task Board</a>
            </div>
            <div className="plus-icon">
              <a href="#">
                <span>Mark Complete</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetails;
