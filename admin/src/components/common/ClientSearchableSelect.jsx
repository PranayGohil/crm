import React, { useCallback } from 'react';
import AsyncSearchableSelect from './AsyncSearchableSelect';
import axios from 'axios';
import debounce from 'lodash/debounce';

const ClientSearchableSelect = ({ 
  value, 
  onChange, 
  error, 
  label = "Client Name",
  placeholder = "Search Client...",
  ...props 
}) => {
  const loadOptions = useCallback(
    debounce((inputValue, callback) => {
      const token = localStorage.getItem("token");
      axios.get(`${process.env.REACT_APP_API_URL}/api/client/search?q=${inputValue}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const options = res.data.clients.map(c => ({
          value: c._id,
          label: c.company_name ? `${c.company_name} / ${c.full_name}` : c.full_name,
          data: c
        }));
        callback(options);
      })
      .catch(err => {
        console.error("Error searching clients:", err);
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

export default ClientSearchableSelect;
