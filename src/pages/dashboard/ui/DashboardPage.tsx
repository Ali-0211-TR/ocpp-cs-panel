import { DashboardStats } from '@widgets/dashboard-stats';
import { useChargePoints } from '@entities/charge-point';
import { Card, Spinner } from '@shared/ui';

export function DashboardPage() {
  const { data: chargePoints, isLoading: cpLoading } = useChargePoints();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <DashboardStats />

      {cpLoading ? (
        <Spinner />
      ) : chargePoints && chargePoints.length > 0 ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Recent Charge Points</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chargePoints.slice(0, 6).map((cp) => (
              <Card key={cp.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{cp.id}</span>
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${cp.is_online ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">{cp.status}</p>
                {cp.model && <p className="text-xs text-gray-400">{cp.vendor} {cp.model}</p>}
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
