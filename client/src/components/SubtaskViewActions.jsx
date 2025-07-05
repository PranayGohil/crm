import React from "react";
import { Link, useParams } from "react-router-dom";

const SubtaskViewActions = ({ total }) => {
  const { projectId } = useParams();
  return (
    <section className="sv-sec2 sv-sec1">
      <div className="sv-sec2-inner">
        <p>
          <a href="#">{total}</a> Subtasks Total
        </p>
      </div>
      <div className="sv-">
        <div className="cd-client_dashboard  cd-client-d-flex">
          <Link
            to={`/subtaskmanagementbulk/${projectId}`}
            className="plus-icon"
          >
            <img src="/SVG/plus.svg" alt="plus" />
            <span>New Subtask</span>
          </Link>
          <a href="CreateProjectContent" className="plus-icon">
            <img src="/SVG/plus.svg" alt="plus" />
            <span>Create Project Content</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SubtaskViewActions;
