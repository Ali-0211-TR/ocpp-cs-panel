import { Link } from 'react-router-dom';
import { useChargePoints, useChargePointStats } from '@entities/charge-point';
import type { ChargePointDto } from '@entities/charge-point';
import { Card, Badge, Spinner, Table } from '@shared/ui';

const columns = [
  {
    key: 'id',
    header: 'Charge Point',
    render: (cp: ChargePointDto) => (
      <Link to={`/charge-points/${cp.id}`} className="font-medium text-blue-600 hover:underline">
        {cp.id}
      </Link>
    ),
  },
  {
    key: 'status_badge',
    header: 'Status',
    render: (cp: ChargePointDto) => (
      <Badge variant={cp.is_online ? 'green' : 'gray'}>{cp.is_online ? 'Online' : 'Offline'}</Badge>
    ),
  },
  { key: 'ocpp_status', header: 'OCPP Status', render: (cp: ChargePointDto) => cp.status },
  { key: 'vendor', header: 'Vendor', render: (cp: ChargePointDto) => cp.vendor ?? '—' },
  { key: 'model', header: 'Model', render: (cp: ChargePointDto) => cp.model ?? '—' },
  { key: 'connectors', header: 'Connectors', render: (cp: ChargePointDto) => cp.connectors?.length ?? 0 },
];

export function ChargePointsPage() {
  const { data: chargePoints, isLoading } = useChargePoints();
  const { data: stats } = useChargePointStats();

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Charge Points</h1>
        {stats && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 font-medium">{stats.online} online</span>
            <span className="text-gray-500">{stats.total} total</span>
          </div>
        )}
      </div>

      {chargePoints && chargePoints.length > 0 ? (
        <Card>
          <Table data={chargePoints} columns={columns} keyExtractor={(cp) => cp.id} />
        </Card>
      ) : (
        <Card className="p-8 text-center text-gray-500">No charge points registered yet.</Card>
      )}
    </div>
  );
}
