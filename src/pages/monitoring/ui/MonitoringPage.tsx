import { useHeartbeats, useConnectionStats } from '@entities/monitoring';
import type { HeartbeatStatusDto } from '@entities/monitoring';
import { Card, Spinner, Table, Badge } from '@shared/ui';
import { formatDate } from '@shared/lib';

const columns = [
  { key: 'cp', header: 'Charge Point', render: (h: HeartbeatStatusDto) => h.charge_point_id },
  {
    key: 'status',
    header: 'Status',
    render: (h: HeartbeatStatusDto) => (
      <Badge variant={h.is_online ? 'green' : 'gray'}>{h.is_online ? 'Online' : 'Offline'}</Badge>
    ),
  },
  { key: 'ocpp_status', header: 'OCPP Status', render: (h: HeartbeatStatusDto) => h.status },
  { key: 'heartbeat', header: 'Last Heartbeat', render: (h: HeartbeatStatusDto) => formatDate(h.last_heartbeat) },
  { key: 'firmware', header: 'Firmware', render: (h: HeartbeatStatusDto) => h.firmware_version ?? '—' },
  {
    key: 'uptime',
    header: 'Uptime',
    render: (h: HeartbeatStatusDto) =>
      h.uptime_seconds != null ? `${(h.uptime_seconds / 3600).toFixed(1)}h` : '—',
  },
];

export function MonitoringPage() {
  const { data: heartbeats, isLoading } = useHeartbeats();
  const { data: stats } = useConnectionStats();

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Monitoring</h1>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-gray-500">Online</p>
            <p className="text-2xl font-bold text-green-600">{stats.online_count}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-500">Offline</p>
            <p className="text-2xl font-bold text-red-600">{stats.offline_count}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-500">Average Uptime</p>
            <p className="text-2xl font-bold">
              {stats.average_uptime_hours != null ? `${stats.average_uptime_hours.toFixed(1)}h` : 'N/A'}
            </p>
          </Card>
        </div>
      )}

      {heartbeats && heartbeats.length > 0 ? (
        <Card>
          <Table data={heartbeats} columns={columns} keyExtractor={(h) => h.charge_point_id} />
        </Card>
      ) : (
        <Card className="p-8 text-center text-gray-500">No heartbeat data available.</Card>
      )}
    </div>
  );
}
