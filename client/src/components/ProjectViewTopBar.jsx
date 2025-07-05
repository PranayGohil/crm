import React from "react";

const ProjectViewTopBar = () => {
  return (
    <section className="anp-add_new_project-header">
      <div className="anp-header-inner">
        <div className="anp-heading-main">
          <a href="#">
            <img src="/SVG/arrow-pc.svg" alt="" />
          </a>
          <div className="anp-heading-txt">
            <h1>Create Project</h1>
          </div>
        </div>
        <div className="anp-header-btn">
          <a href="#" className="anp-delete-btn">
            <img src="/SVG/delete-vec.svg" alt="Delete" />
            Delete Project
          </a>
          <a href="#" className="anp-save-btn">
            <img src="/SVG/save-vec.svg" alt="save" />
            Save Project
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProjectViewTopBar;
