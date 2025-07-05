import React, { useState } from "react";
import ClientDashboardTopBar from "../components/ClientDashboardTopBar";
import ClientInfoSummary from "../components/ClientInfoSummary";
import ClientTaskList from "../components/ClientTaskList";

const ClientDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <ClientDashboardTopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ClientInfoSummary />
      <ClientTaskList searchTerm={searchTerm} />
    </>
  );
};

export default ClientDashboardPage;
