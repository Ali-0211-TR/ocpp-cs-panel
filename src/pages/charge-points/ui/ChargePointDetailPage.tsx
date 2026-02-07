import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChargePoint } from '@entities/charge-point';
import { useChargePointTransactions } from '@entities/transaction';
import type { TransactionDto } from '@entities/transaction';
import { RemoteStartForm, RemoteStopButton, ResetButton } from '@features/charge-point-commands';
import { Card, Badge, Spinner, Button, Table } from '@shared/ui';
import { formatDate, formatEnergy } from '@shared/lib';

const txColumns = [
  { key: 'id', header: 'ID', render: (tx: TransactionDto) => tx.id },
  { key: 'id_tag', header: 'ID Tag', render: (tx: TransactionDto) => tx.id_tag },
  { key: 'connector', header: 'Connector', render: (tx: TransactionDto) => tx.connector_id },
  { key: 'start', header: 'Start', render: (tx: TransactionDto) => formatDate(tx.started_at) },
  { key: 'stop', header: 'Stop', render: (tx: TransactionDto) => tx.stopped_at ? formatDate(tx.stopped_at) : '—' },
  {
    key: 'energy',
    header: 'Energy',
    render: (tx: TransactionDto) => formatEnergy(tx.energy_consumed_wh ?? 0),
  },
  {
    key: 'status',
    header: 'Status',
    render: (tx: TransactionDto) => (
      <Badge variant={tx.stopped_at ? 'gray' : 'green'}>{tx.stopped_at ? 'Completed' : 'Active'}</Badge>
    ),
  },
];

export function ChargePointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cp, isLoading } = useChargePoint(id!);
  const { data: transactionsData } = useChargePointTransactions(id!);
  const [remoteStartOpen, setRemoteStartOpen] = useState(false);

  if (isLoading || !cp) return <Spinner />;

  const transactions = transactionsData?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{cp.id}</h1>
          <p className="text-sm text-gray-500">{cp.vendor} {cp.model}</p>
        </div>
        <Badge variant={cp.is_online ? 'green' : 'gray'} className="text-sm">
          {cp.is_online ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Details</h2>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Status</dt>
            <dd>{cp.status}</dd>
            <dt className="text-gray-500">Firmware</dt>
            <dd>{cp.firmware_version ?? '—'}</dd>
            <dt className="text-gray-500">Last Heartbeat</dt>
            <dd>{cp.last_heartbeat ? formatDate(cp.last_heartbeat) : '—'}</dd>
            <dt className="text-gray-500">Registered</dt>
            <dd>{formatDate(cp.registered_at)}</dd>
          </dl>
        </Card>

        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Commands</h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setRemoteStartOpen(true)}>
              Remote Start
            </Button>
            <ResetButton chargePointId={cp.id} type="Soft" />
            <ResetButton chargePointId={cp.id} type="Hard" />
          </div>
        </Card>
      </div>

      {cp.connectors && cp.connectors.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Connectors</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cp.connectors.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Connector #{c.id}</span>
                  <Badge variant={c.status === 'Available' ? 'green' : c.status === 'Charging' ? 'blue' : 'gray'}>
                    {c.status}
                  </Badge>
                </div>
                {c.error_code && c.error_code !== 'NoError' && (
                  <p className="mt-1 text-xs text-red-500">{c.error_code}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {transactions.length > 0 && (
        <Card>
          <div className="p-5 pb-0">
            <h2 className="font-semibold text-gray-900">Transactions</h2>
          </div>
          <Table data={transactions} columns={txColumns} keyExtractor={(tx) => tx.id.toString()} />
        </Card>
      )}

      {transactions
        .filter((tx) => !tx.stopped_at)
        .map((tx) => (
          <RemoteStopButton key={tx.id} chargePointId={cp.id} transactionId={tx.id} />
        ))}

      <RemoteStartForm chargePointId={cp.id} open={remoteStartOpen} onClose={() => setRemoteStartOpen(false)} />
    </div>
  );
}
