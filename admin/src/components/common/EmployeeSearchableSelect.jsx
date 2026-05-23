import React, { useCallback } from 'react';
import AsyncSearchableSelect from './AsyncSearchableSelect';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeSearchableSelect = ({ 
  value, 
  onChange, 
  error, 
  label = "Employee Name",
  placeholder = "Search Employee...",
  stages,   // optional array of stage names to filter employees by
  ...props 
}) => {
  const { user } = useAuth();
  const loadOptions = useCallback(
    debounce((inputValue, callback) => {
      const token = localStorage.getItem("token");
      const stagesParam = stages && stages.length > 0
        ? `&stages=${encodeURIComponent(stages.join(","))}`
        : "";
      axios.get(`${process.env.REACT_APP_API_URL}/api/employee/search?q=${inputValue}${stagesParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const filtered = res.data.employees.filter(e => {
          if (!user) return true;
          if (user.role === "super-admin") return true;
          const adminStages = user.manage_stages || [];
          const empStages = e.manage_stages || [];
          if (empStages.length === 0) return true;
          return empStages.some(s => adminStages.includes(s));
        });
        const options = filtered.map(e => ({
          value: e._id,
          label: e.manage_stages?.length
            ? `${e.full_name} (${e.manage_stages.join(", ")})`
            : e.full_name,
          data: e
        }));
        callback(options);
      })
      .catch(err => {
        console.error("Error searching employees:", err);
        callback([]);
      });
    }, 300),
    [stages, user]  // recreate debounced fn when stages or user change
  );

  return (
    <AsyncSearchableSelect
      label={label}
      placeholder={placeholder}
      loadOptions={loadOptions}
      value={value}
      onChange={onChange}
      error={error}
      {...props}
    />
  );
};

export default EmployeeSearchableSelect;
