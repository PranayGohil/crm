import React from "react";

const ClientHeader = ({ client }) => {
  return (
    <section className="cdl-main_main_inner">
      <div className="cdl-main">
        <div className="cdl-main-inner cnc-sec2-inner">
          <h1>{client.full_name}</h1>
          <div className="cnc-active">
            <div className="active-prn-activity">
              <img src="/SVG/dot.svg" alt="dot" />
              <p>Active</p>
            </div>
            <p>
              Client ID: <span>#{client._id}</span>
            </p>
          </div>
        </div>
        <div className="edit-profile">
          <a href={`/EditClient/${client.username}`}>
            <img src="/SVG/edit-white.svg" alt="edit" />
            Edit
          </a>
        </div>
      </div>
    </section>
  );
};

export default ClientHeader;
