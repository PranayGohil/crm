import React, { useState, useRef, useEffect } from 'react';

// TODO: Replace with API call
// const filtersData = [
//   { label: 'Filter Employee', options: ['In progress', 'To do', 'Pause', 'Block', 'Done'] },
//   { label: 'Priority', options: ['In progress', 'To do', 'Pause', 'Block', 'Done'] },
//   { label: 'Stage', options: ['In progress', 'To do', 'Pause', 'Block', 'Done'] },
// ];

const SubtaskFilters = () => {
  const filtersData = [
    { label: 'Filter Employee', options: ['em1', 'em2', 'em3', 'em4', 'em5'] },
    { label: 'Priority', options: ['High', 'Medium', 'low'] },
    { label: 'Stage', options: ['render', 'Desing', 'Desing', 'Desing', 'Desing'] },
  ];

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selections, setSelections] = useState({});
  const containerRef = useRef(null);

  const handleToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleSelect = (index, option) => {
    setSelections((prev) => ({ ...prev, [index]: option }));
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <section className="cpd-filters_section">
      <div className="cpd-only-menu" ref={containerRef}>
        <div className="cpd-filters_inner">
          <div className="cpd-menu-bar">
            {filtersData.map((filter, index) => (
              <div className={`btn_main ${activeDropdown === index ? 'open' : ''}`} key={index}>
                <div className={`dropdown_toggle${index === 0 ? ' css-menu1' : ''}`} onClick={() => handleToggle(index)}>
                  <span className="text_btn">{selections[index] || filter.label}</span>
                  <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon" />
                </div>
                <ul className="dropdown_menu">
                  {filter.options.map((option, optIndex) => (
                    <li key={optIndex} onClick={() => handleSelect(index, option)}>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="css-filter">
          <img src="/SVG/filter-vector.svg" alt="search" />
          <span>Reset Filters</span>
        </div>
      </div>
    </section>
  );
};

export default SubtaskFilters;

