import React from "react";
import "./LoadingOverlay.css"; 

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <img
        src="/loader.gif" 
        alt="Loading..."
        className="loading-gif"
      />
    </div>
  );
};

export default LoadingOverlay;
