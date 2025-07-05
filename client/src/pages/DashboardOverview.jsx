import React from "react";
import TotalCardOverview from "../components/DashboardSummaryCards";
import UpcomingDueDatesTable from "../components/UpcomingDueDates";
import RecentProjects from "../components/RecentProjects";
import NotificationPanel from "../components/NotificationPanel";

const DashboardOverview = () => {
  return (
    <>
      <TotalCardOverview />
      <UpcomingDueDatesTable />
      <RecentProjects />
      <NotificationPanel />
    </>
  );
};

export default DashboardOverview;
