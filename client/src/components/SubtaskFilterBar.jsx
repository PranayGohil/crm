import React, { useState, useRef, useEffect } from "react";

// Reusable Dropdown Component
const Dropdown = ({ label, options, selected, setSelected }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleSelect = (option) => {
    setSelected(option);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`btn_main${open ? " open" : ""}`} ref={ref}>
      <div className="dropdown_toggle" onClick={() => setOpen(!open)}>
        <span className="text_btn">{selected || label}</span>
        <img src="/SVG/header-vector.svg" alt="arrow" className="arrow_icon" />
      </div>
      {open && (
        <ul className="dropdown_menu">
          {options.map((option, index) => (
            <li key={index} onClick={() => handleSelect(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Parent Filter Bar Component
const SubtaskFilterBar = ({ filters, setFilters }) => {
  const assignToOptions = ["em1", "em2", "em3", "em4", "em5"];
  const priorityOptions = ["Low", "Medium", "High"];
  const stageOptions = ["Design", "Render"];

  return (
    <section className="sv-sec3 cpd-filters_section">
      <div className="sv-sec3-inner cpd-only-menu">
        <div className="cpd-filters_inner">
          <div className="cpd-menu-bar">
            <Dropdown
              label="Assign To"
              options={assignToOptions}
              selected={filters.assignTo}
              setSelected={(v) =>
                setFilters((prev) => ({ ...prev, assignTo: v }))
              }
            />
            <Dropdown
              label="Priority"
              options={priorityOptions}
              selected={filters.priority}
              setSelected={(v) =>
                setFilters((prev) => ({ ...prev, priority: v }))
              }
            />
            <Dropdown
              label="Stage"
              options={stageOptions}
              selected={filters.stage}
              setSelected={(v) => setFilters((prev) => ({ ...prev, stage: v }))}
            />
          </div>
          <div className="css-filter">
            <img src="/SVG/filter-vector.svg" alt="filter icon" />
            <span
              onClick={() =>
                setFilters({ assignTo: "", priority: "", stage: "" })
              }
            >
              Reset Filters
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubtaskFilterBar;
