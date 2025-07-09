import React from "react";

const LoadingOverlay = ({ show }) => {
  if (!show) return null;
  return (
    <div className="global-loading-overlay">
      <div className="loader"></div>
    </div>
  );
};

export default LoadingOverlay;
