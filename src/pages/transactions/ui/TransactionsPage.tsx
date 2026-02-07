import { useState } from 'react';
import { useTransactions } from '@entities/transaction';
import type { TransactionDto } from '@entities/transaction';
import { Card, Spinner, Table, Badge } from '@shared/ui';
import { formatDate, formatEnergy } from '@shared/lib';

const columns = [
  { key: 'id', header: 'ID', render: (tx: TransactionDto) => tx.id },
  { key: 'cp', header: 'Charge Point', render: (tx: TransactionDto) => tx.charge_point_id },
  { key: 'id_tag', header: 'ID Tag', render: (tx: TransactionDto) => tx.id_tag },
  { key: 'connector', header: 'Connector', render: (tx: TransactionDto) => tx.connector_id },
  {
    key: 'status',
    header: 'Status',
    render: (tx: TransactionDto) =>
      tx.stopped_at ? (
        <Badge variant="gray">Completed</Badge>
      ) : (
        <Badge variant="green">Active</Badge>
      ),
  },
  { key: 'start', header: 'Start', render: (tx: TransactionDto) => formatDate(tx.started_at) },
  {
    key: 'energy',
    header: 'Energy',
    render: (tx: TransactionDto) => formatEnergy(tx.energy_consumed_wh ?? 0),
  },
];

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTransactions({ page, limit: 20 });

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>

      {data && data.items.length > 0 ? (
        <>
          <Card>
            <Table data={data.items} columns={columns} keyExtractor={(tx) => tx.id.toString()} />
          </Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {data.page} of {data.total_pages} ({data.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.total_pages}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <Card className="p-8 text-center text-gray-500">No transactions yet.</Card>
      )}
    </div>
  );
}
