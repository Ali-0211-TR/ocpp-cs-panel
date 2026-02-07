import { useState } from 'react';
import { useTariffs, useDeleteTariff } from '@entities/tariff';
import type { TariffResponse } from '@entities/tariff';
import { CreateTariffForm } from '@features/tariff-management';
import { Card, Spinner, Table, Badge, Button } from '@shared/ui';
import toast from 'react-hot-toast';

export function TariffsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: tariffs, isLoading } = useTariffs();
  const deleteMutation = useDeleteTariff();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Tariff deleted'),
      onError: () => toast.error('Failed to delete tariff'),
    });
  };

  const columns = [
    { key: 'name', header: 'Name', render: (t: TariffResponse) => t.name },
    { key: 'type', header: 'Type', render: (t: TariffResponse) => t.tariff_type },
    { key: 'price_kwh', header: 'Price/kWh', render: (t: TariffResponse) => `${t.price_per_kwh} ${t.currency}` },
    { key: 'price_min', header: 'Price/min', render: (t: TariffResponse) => `${t.price_per_minute} ${t.currency}` },
    { key: 'session_fee', header: 'Session Fee', render: (t: TariffResponse) => `${t.session_fee} ${t.currency}` },
    {
      key: 'status',
      header: 'Status',
      render: (t: TariffResponse) => (
        <div className="flex gap-1">
          {t.is_active ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Inactive</Badge>}
          {t.is_default && <Badge variant="blue">Default</Badge>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t: TariffResponse) => (
        <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>
          Delete
        </Button>
      ),
    },
  ];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tariffs</h1>
        <Button onClick={() => setCreateOpen(true)}>Create Tariff</Button>
      </div>

      {tariffs && tariffs.length > 0 ? (
        <Card>
          <Table data={tariffs} columns={columns} keyExtractor={(t) => t.id.toString()} />
        </Card>
      ) : (
        <Card className="p-8 text-center text-gray-500">No tariffs configured yet.</Card>
      )}

      <CreateTariffForm open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
