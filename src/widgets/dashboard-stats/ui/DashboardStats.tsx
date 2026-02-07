import { useConnectionStats } from '@entities/monitoring';
import { Spinner, Card } from '@shared/ui';
import { Zap, Wifi, WifiOff } from 'lucide-react';

export function DashboardStats() {
  const { data: stats, isLoading } = useConnectionStats();

  if (isLoading) return <Spinner />;
  if (!stats) return null;

  const cards = [
    { label: 'Total Charge Points', value: stats.total_charge_points, icon: Zap, color: 'text-blue-600' },
    { label: 'Online', value: stats.online_count, icon: Wifi, color: 'text-green-600' },
    { label: 'Offline', value: stats.offline_count, icon: WifiOff, color: 'text-red-600' },
    {
      label: 'Avg Uptime',
      value: stats.average_uptime_hours != null ? `${stats.average_uptime_hours.toFixed(1)}h` : 'N/A',
      icon: Zap,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="flex items-center gap-4 p-5">
          <div className={`rounded-lg bg-gray-100 p-3 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
