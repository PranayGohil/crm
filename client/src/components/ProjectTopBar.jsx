import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const ProjectTopBar = ({
  selectedClient,
  setSelectedClient,
  selectedStatus,
  setSelectedStatus,
}) => {
  const [clients, setClients] = useState([]);
  const statuses = ["To do", "In progress", "In Review", "Block", "Done"];
  const clientDropdownRef = useRef();
  const statusDropdownRef = useRef();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`);
        setClients(res.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(e.target)
      )
        clientDropdownRef.current.classList.remove("open");
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target)
      )
        statusDropdownRef.current.classList.remove("open");
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <section className="header">
      <div className="head-menu">
        <h1>All Projects</h1>
        <div className="menu-bar">
          <div className="btn_main" ref={clientDropdownRef}>
            <div
              className="dropdown_toggle header-dropdown-width"
              onClick={() => clientDropdownRef.current.classList.toggle("open")}
            >
              <span className="text_btn">{selectedClient}</span>
              <img src="/SVG/arrow.svg" alt="vec" className="arrow_icon" />
            </div>
            <ul className="dropdown_menu">
              <li onClick={() => setSelectedClient("All Client")}>
                All Client
              </li>
              {clients.map((client, idx) => (
                <li
                  key={idx}
                  onClick={() => setSelectedClient(client.full_name)}
                >
                  {client.full_name}
                </li>
              ))}
            </ul>
          </div>

          <div className="btn_main" ref={statusDropdownRef}>
            <div
              className="dropdown_toggle"
              onClick={() => statusDropdownRef.current.classList.toggle("open")}
            >
              <span className="text_btn">{selectedStatus}</span>
              <img src="/SVG/arrow.svg" alt="vec" className="arrow_icon" />
            </div>
            <ul className="dropdown_menu">
              <li onClick={() => setSelectedStatus("All Status")}>
                All Status
              </li>
              {statuses.map((status, idx) => (
                <li key={idx} onClick={() => setSelectedStatus(status)}>
                  {status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="nav-bar">
        <div className="nav-search justify_end">
          <div className="searchbar">
            <div className="input-type">
              <div className="img-search-input">
                <img src="/SVG/search-icon.svg" alt="search" />
              </div>
              <div className="input-type-txt">
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  style={{ border: "none" }}
                />
              </div>
            </div>
          </div>
          <div className="add-mbr">
            <a href="AddNewProject" className="plus-icon">
              <img src="/SVG/plues.svg" alt="add" />
              <span>Add Project</span>
            </a>
          </div>
        </div>
        <div className="filter">
          <img src="/SVG/filter.svg" alt="filter" />
          <span>Reset Filters</span>
        </div>
      </div>
    </section>
  );
};

export default ProjectTopBar;
