import React from "react";

const ClientHeader = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="cd-client_dashboard header">
      <div className="cd-head-menu head-menu">
        <h1>Client Dashboard</h1>
        <p>Manage your clients and monitor their task progress</p>
      </div>

      <div className="cd-nav-bar nav-bar">
        <div className="cd-nav-search nav-search">
          <div className="cd-searchbar searchbar">
            <div className="cd-input-type input-type">
              <div className="cd-img-search-input img-search-input">
                <img src="/SVG/search-icon.svg" alt="search" />
              </div>
              <div className="cd-input-type-txt input-type-txt">
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  style={{ border: "none" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="cd-add-mbr add-mbr">
            <div className="cd-client_dashboard plus-icon">
              <a href="createnewclient">
                <img src="/SVG/plus.svg" alt="add" />
                <span>Add Client</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientHeader;
