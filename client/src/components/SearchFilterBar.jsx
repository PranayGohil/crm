import React, { useState } from "react";

const dropdownData = {
  clients: [
    "Client-1",
    "Client-2",
    "Client-3Client-3Client-3",
    "Client-4",
    "Client-5",
  ],
  status: ["To do", "In progress", "Pause", "Blocked", "Done"],
  stage: ["Hr", "CEO", "CO-CEO", "Desinger", "Render"],
  priority: ["High", "Medium", "low"],
};

const SearchFilterBar = ({ filters, setFilters }) => {

  const [openDropdown, setOpenDropdown] = useState(null);

  const handleToggle = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleSelect = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOpenDropdown(null);
  };

  return (
    <section className="ttb-search-btn-bar-main">
      <div className="ttb-search-btn-bar-main-inner">
        <div className="searchbar ttb-searchbar-main">
          <div className="ttb-searchbar-main-inner">
            <div className="input-type ttb-search-bar">
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
            <div className="ttb-all-btn-main">
              {[
                {
                  key: "client",
                  label: filters.client,
                  options: dropdownData.clients,
                },
                {
                  key: "status",
                  label: filters.status,
                  options: dropdownData.status,
                },
                {
                  key: "stage",
                  label: filters.stage,
                  options: dropdownData.stage,
                },
                {
                  key: "priority",
                  label: filters.priority,
                  options: dropdownData.priority,
                },
              ].map(({ key, label, options }) => (
                <div
                  key={key}
                  className={`btn_main ttb-btn ${
                    openDropdown === key ? "open" : ""
                  }`}
                >
                  <div
                    className="dropdown_toggle"
                    onClick={() => handleToggle(key)}
                  >
                    <span className="text_btn">{label}</span>
                    <img
                      src="/SVG/arrow.svg"
                      alt="vec"
                      className="arrow_icon"
                    />
                  </div>
                  <ul className="dropdown_menu">
                    {options.map((option, index) => (
                      <li key={index} onClick={() => handleSelect(key, option)}>
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="filter ttb-filter">
                <img src="/SVG/filter-white.svg" alt="filter white" />
                <span>Reset Filters</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFilterBar;
