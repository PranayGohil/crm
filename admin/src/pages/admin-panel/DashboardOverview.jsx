import TotalCardOverview from "../../components/admin/DashboardSummaryCards";
import UpcomingDueDatesTable from "../../components/admin/UpcomingDueDates";
import RecentProjects from "../../components/admin/RecentProjects";
// import NotificationPanel from "../../components/admin/NotificationPanel";

const DashboardOverview = () => {
  return (
    <>
      <TotalCardOverview />
      <UpcomingDueDatesTable />
      <RecentProjects />
      {/* <NotificationPanel /> */}
    </>
  );
};

export default DashboardOverview;
