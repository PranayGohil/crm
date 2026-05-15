import React, { useCallback } from 'react';
import AsyncSearchableSelect from './AsyncSearchableSelect';
import axios from 'axios';
import debounce from 'lodash/debounce';

const EmployeeSearchableSelect = ({ 
  value, 
  onChange, 
  error, 
  label = "Employee Name",
  placeholder = "Search Employee...",
  ...props 
}) => {
  const loadOptions = useCallback(
    debounce((inputValue, callback) => {
      const token = localStorage.getItem("token");
      axios.get(`${process.env.REACT_APP_API_URL}/api/employee/search?q=${inputValue}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const options = res.data.employees.map(e => ({
          value: e._id,
          label: e.department ? `${e.full_name} - ${e.department}` : e.full_name,
          data: e
        }));
        callback(options);
      })
      .catch(err => {
        console.error("Error searching employees:", err);
        callback([]);
      });
    }, 300),
    []
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
