import React from "react";
import { useNavigate, Link } from "react-router-dom";

const CreateMemberHeader = ({ onSave }) => {
  const navigate = useNavigate();
  return (
    <section className="page3-main1">
      <div className="member-profile-edit">
        <div className="anp-header-inner">
          <div className="anp-heading-main">
            <Link
              to="/project/dashboard"
              className="anp-back-btn"
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
            >
              <img
                src="/SVG/arrow-pc.svg"
                alt="back"
                className="mx-2"
                style={{ scale: "1.3" }}
              />
            </Link>
            <div className="head-menu">
              <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
                Create Employee Profile{" "}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateMemberHeader;
