import React from 'react';
import Select from 'react-select';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  isClearable = true, 
  isLoading = false,
  isDisabled = false,
  error = null,
  label = null,
  ...props 
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: '0.5rem',
      borderColor: error ? '#b91c1c' : state.isFocused ? '#1d4ed8' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(29, 78, 216, 0.2)' : null,
      '&:hover': {
        borderColor: state.isFocused ? '#1d4ed8' : '#9ca3af'
      },
      padding: '0.125rem',
      fontSize: '0.875rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#1d4ed8' 
        : state.isFocused 
          ? '#dbeafe' 
          : 'white',
      color: state.isSelected ? 'white' : '#374151',
      fontSize: '0.875rem',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#1d4ed8',
        color: 'white'
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af'
    })
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Select
        styles={customStyles}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isLoading={isLoading}
        isDisabled={isDisabled}
        {...props}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
