import TotalCardOverview from "../../components/admin/DashboardSummaryCards";
import UpcomingDueDatesTable from "../../components/admin/UpcomingDueDates";
import RecentProjects from "../../components/admin/RecentProjects";
import EarningsWidget from "../../components/admin/EarningsWidget";
import NotificationPanel from "../../components/admin/NotificationPanel";

const DashboardOverview = () => {
  return (
    <div className="p-3 sm:p-4 max-w-full overflow-x-hidden">
      <TotalCardOverview />

      {/* Two-column layout on large screens: main content + sidebar */}
      <div className="flex flex-col xl:flex-row gap-4 mt-4">
        {/* Left / Main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <UpcomingDueDatesTable />
          <RecentProjects />
        </div>

        {/* Right / Sidebar column */}
        <div className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-4">
          <EarningsWidget />
          <NotificationPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;