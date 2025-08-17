import TotalCardOverview from "../../components/admin/DashboardSummaryCards";
import UpcomingDueDatesTable from "../../components/admin/UpcomingDueDates";
import RecentProjects from "../../components/admin/RecentProjects";
import NotificationPanel from "../../components/admin/NotificationPanel";

const DashboardOverview = () => {
  return (
    <div className="p-4">
      <TotalCardOverview />
      <UpcomingDueDatesTable />
      <RecentProjects />
      <NotificationPanel />
    </div>
  );
};

export default DashboardOverview;
