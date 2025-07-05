import React, { useState } from "react";
import ProjectTopBar from "../components/ProjectTopBar";
import ActiveProjectCards from "../components/ActiveProjectCards";

const AllProject = () => {
  const [selectedClient, setSelectedClient] = useState("All Client");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  return (
    <div className="all-project-page">
      <ProjectTopBar
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />
      <ActiveProjectCards
        selectedClient={selectedClient}
        selectedStatus={selectedStatus}
      />
    </div>
  );
};

export default AllProject;
