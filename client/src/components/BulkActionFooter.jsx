import React, { useState, useRef, useEffect } from 'react';

// TODO: Replace with API call
/*
const assignOptions = [
  { name: 'Ankit Bhatt', image: '/Image/prn1.png' },
  ...
];
*/
const assignOptions = new Array(5).fill({ name: 'Ankit Bhatt', image: '/Image/prn1.png' });

const priorityOptions = [
  { label: 'High', className: 'css-high', icon: '/SVG/high-vec.svg' },
  { label: 'Medium', className: 'css-medium', icon: '/SVG/mid-vec.svg' },
  { label: 'Low', className: 'css-low', icon: '/SVG/cpd-info-blue.svg' },
];

const stageOptions = [
  { label: 'Render', className: 'css-render' },
  { label: 'Stone', className: 'css-Stone' },
  { label: 'Cad-design', className: 'Cad-design' },
];

const Dropdown = ({ label, options, renderItem }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(label);
  const ref = useRef(null);

  const handleSelect = (itemLabel) => {
    setSelected(itemLabel);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`btn_main${open ? ' open' : ''}`} ref={ref}>
      <div className="dropdown_toggle" onClick={() => setOpen(!open)}>
        <span className="text_btn">{selected}</span>
        <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon" />
      </div>
      {open && (
        <ul className="dropdown_menu css-drop-menu1">
          {options.map((opt, idx) => (
            <li key={idx} onClick={() => handleSelect(opt.label || opt.name)}>
              {renderItem(opt)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const BulkActionFooter = () => {
  return (
    <section>
      <div className="sv-last-sec css-sec-last">
        <div className="sv-last-sec-inner css-sec-last-inner">
          <p><span>3</span> items selected</p>
          <div className="css-select_all"><a href="#">Select All</a></div>
          <div className="css-clear_all"><a href="#">Clear Selection</a></div>
        </div>
        <div className="cpd-filters_inner">
          <div className="cpd-menu-bar">
            <Dropdown
              label="Assign To"
              options={assignOptions}
              renderItem={(opt) => (
                <span className="css-ankit">
                  <img src={opt.image} alt="person" />
                  {opt.name}
                </span>
              )}
            />
            <Dropdown
              label="Set Priority"
              options={priorityOptions}
              renderItem={(opt) => (
                <span className={`css-priority ${opt.className}`}>
                  <img src={opt.icon} alt="priority" />
                  {opt.label}
                </span>
              )}
            />
            <Dropdown
              label="Change Stage"
              options={stageOptions}
              renderItem={(opt) => (
                <span className={`css-stage ${opt.className}`}>{opt.label}</span>
              )}
            />
            <div className="css-delete_btn">
              <a href="#" className="css-high css-delete">
                <img src="/SVG/delete-vec.svg" alt="del" />
                Delete Selected
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkActionFooter;


