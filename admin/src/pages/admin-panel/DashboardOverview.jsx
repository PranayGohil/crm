import React from "react";
import TotalCardOverview from "../../components/DashboardSummaryCards";
import UpcomingDueDatesTable from "../../components/UpcomingDueDates";
import RecentProjects from "../../components/RecentProjects";
import NotificationPanel from "../../components/NotificationPanel";
import NotificationAdmin from "./NotificationAdmin";

const DashboardOverview = () => {
  return (
    <>
      <TotalCardOverview />
      <UpcomingDueDatesTable />
      <RecentProjects />
      <NotificationAdmin />
    </>
  );
};

export default DashboardOverview;
