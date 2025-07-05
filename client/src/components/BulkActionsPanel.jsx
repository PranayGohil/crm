import React, { useState } from 'react';

// TODO: Replace with API call
// const employees = [
//   { name: 'Ankit Bhatt', image: '/Image/prn1.png' },
//   ...
// ];
// const priorities = [
//   { label: 'High', className: 'css-high', icon: '/SVG/high-vec.svg' },
//   ...
// ];
// const stages = [
//   { label: 'Render', className: 'css-render' },
//   ...
// ];

const employees = [
  { name: 'Ankit Bhatt', image: '/Image/prn1.png' },
  { name: 'Ankit Bhatt', image: '/Image/prn1.png' },
  { name: 'Ankit Bhatt', image: '/Image/prn1.png' },
  { name: 'Ankit Bhatt', image: '/Image/prn1.png' },
  { name: 'Ankit Bhatt', image: '/Image/prn1.png' },
];

const priorities = [
  { label: 'High', className: 'css-high', icon: '/SVG/high-vec.svg' },
  { label: 'Medium', className: 'css-medium', icon: '/SVG/mid-vec.svg' },
  { label: 'Low', className: 'css-low', icon: '/SVG/cpd-info-blue.svg' },
];

const stages = [
  { label: 'Render', className: 'css-render' },
  { label: 'Stone', className: 'css-Stone' },
  { label: 'Cad-design', className: 'Cad-design' },
];

const BulkActionsPanel = () => {
  const [selectedItems, setSelectedItems] = useState(3);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  return (
    <section className="all-last-main" onClick={closeDropdowns}>
      <div className="css-sec-last">
        <div className="css-sec-last-inner">
          <p><span>{selectedItems} </span>items selected</p>
          <div className="css-select_all"><a href="#">Select All</a></div>
          <div className="css-clear_all"><a href="#">Clear Selection</a></div>
        </div>
        <div className="cpd-filters_inner">
          <div className="cpd-menu-bar">
            <div className={`btn_main ${openDropdown === 0 ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className="dropdown_toggle" onClick={() => toggleDropdown(0)}>
                <span className="text_btn">Assign To</span>
                <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon" />
              </div>
              <ul className="css-drop-menu1 dropdown_menu">
                {employees.map((emp, idx) => (
                  <li key={idx}>
                    <span className="css-ankit">
                      <img src={emp.image} alt="emp" />
                      {emp.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`btn_main ${openDropdown === 1 ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className="dropdown_toggle" onClick={() => toggleDropdown(1)}>
                <span className="text_btn">Set Priority</span>
                <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon" />
              </div>
              <ul className="css-drop-menu2 dropdown_menu">
                {priorities.map((pri, idx) => (
                  <li key={idx}>
                    <span className={`css-priority ${pri.className}`}>
                      <img src={pri.icon} alt={pri.label.toLowerCase()} />
                      {pri.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`btn_main ${openDropdown === 2 ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className="dropdown_toggle" onClick={() => toggleDropdown(2)}>
                <span className="text_btn">Change Stage</span>
                <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon" />
              </div>
              <ul className="css-drop-menu2 dropdown_menu">
                {stages.map((stage, idx) => (
                  <li key={idx}>
                    <span className={`css-stage ${stage.className}`}>
                      {stage.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="css-delete_btn">
              <a href="#" className="css-high css-delete">
                <img src="/SVG/delete-vec.svg" alt="del" />Delete Selected
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkActionsPanel;
