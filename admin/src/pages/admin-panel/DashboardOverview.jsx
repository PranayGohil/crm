import TotalCardOverview from "../../components/admin/DashboardSummaryCards";
import UpcomingDueDatesTable from "../../components/admin/UpcomingDueDates";
import RecentProjects from "../../components/admin/RecentProjects";
import EarningsWidget from "../../components/admin/EarningsWidget";
import NotificationPanel from "../../components/admin/NotificationPanel";

const DashboardOverview = () => {
  return (
    <div className="p-4">
      <TotalCardOverview />
      <UpcomingDueDatesTable />
      <RecentProjects />
      <EarningsWidget />
      <NotificationPanel />
    </div>
  );
};

export default DashboardOverview;
