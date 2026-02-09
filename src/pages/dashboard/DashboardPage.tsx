import { PageHeader } from '@widgets/layout';
import { 
  StatsOverview, 
  RevenueChart, 
  EnergyChart, 
  ActiveSessions,
  ChargePointsOverview 
} from '@widgets/dashboard';
import { LiveEventsFeed } from '@features/websocket';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Дашборд"
        description="Обзор системы зарядных станций"
      />

      {/* Stats Overview */}
      <StatsOverview />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <EnergyChart />
      </div>

      {/* Active Sessions and Charge Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChargePointsOverview />
        </div>
        <ActiveSessions />
      </div>

      {/* Live Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveEventsFeed maxEvents={10} />
      </div>
    </div>
  );
}
