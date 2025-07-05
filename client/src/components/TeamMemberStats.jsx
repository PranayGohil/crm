import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TeamMemberStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    onLeave: 0,
    active: 0,
    departments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`);
        const employees = res.data;

        const total = employees.length;
        const onLeave = employees.filter(emp => emp.status === 'on-leave').length;
        const active = employees.filter(emp => emp.status === 'active').length;
        const departments = new Set(employees.map(emp => emp.department)).size;

        setStats({ total, onLeave, active, departments });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    { label: 'Total Members', value: stats.total, icon: '/SVG/icon-1.svg', className: 'inf-sec-1' },
    { label: 'On Leave', value: stats.onLeave, icon: '/SVG/icon-2.svg', className: 'inf-sec-2' },
    { label: 'Active Now', value: stats.active, icon: '/SVG/icon-3.svg', className: 'inf-sec-3' },
    { label: 'Department', value: stats.departments, icon: '/SVG/icon-4.svg', className: 'inf-sec-4' },
  ];

  return (
    <section className="main-1">
      <div className="member-inf">
        {statsData.map((item, index) => (
          <div className={`${item.className} inf-sec`} key={index}>
            <div className="name1">
              <p>{item.label}</p>
              <span>{item.value}</span>
            </div>
            <div className="inf-icon">
              <img src={item.icon} alt="icon" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamMemberStats;
