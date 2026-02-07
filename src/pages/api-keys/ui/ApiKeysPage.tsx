import { useState } from 'react';
import type { FormEvent } from 'react';
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '@entities/api-key';
import type { ApiKeyResponse } from '@entities/api-key';
import { Card, Spinner, Table, Badge, Button, Input, Modal } from '@shared/ui';
import { formatDate } from '@shared/lib';
import toast from 'react-hot-toast';

export function ApiKeysPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = useApiKeys();
  const createMutation = useCreateApiKey();
  const deleteMutation = useDeleteApiKey();

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { name, expires_in_days: expiresInDays ? Number(expiresInDays) : undefined },
      {
        onSuccess: (data) => {
          setNewKeyValue(data.full_key);
          setName('');
          setExpiresInDays('');
          toast.success('API Key created');
        },
        onError: () => toast.error('Failed to create API Key'),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('API Key deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  const columns = [
    { key: 'name', header: 'Name', render: (k: ApiKeyResponse) => k.name },
    { key: 'prefix', header: 'Prefix', render: (k: ApiKeyResponse) => <span className="font-mono">{k.key_prefix}...</span> },
    {
      key: 'status',
      header: 'Status',
      render: (k: ApiKeyResponse) => (
        <Badge variant={k.is_active ? 'green' : 'gray'}>{k.is_active ? 'Active' : 'Inactive'}</Badge>
      ),
    },
    { key: 'created', header: 'Created', render: (k: ApiKeyResponse) => formatDate(k.created_at) },
    { key: 'expires', header: 'Expires', render: (k: ApiKeyResponse) => k.expires_at ? formatDate(k.expires_at) : 'Never' },
    { key: 'last_used', header: 'Last Used', render: (k: ApiKeyResponse) => k.last_used_at ? formatDate(k.last_used_at) : 'Never' },
    {
      key: 'actions',
      header: 'Actions',
      render: (k: ApiKeyResponse) => (
        <Button size="sm" variant="danger" onClick={() => handleDelete(k.id)}>
          Delete
        </Button>
      ),
    },
  ];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <Button onClick={() => setCreateOpen(true)}>Create API Key</Button>
      </div>

      {apiKeys && apiKeys.length > 0 ? (
        <Card>
          <Table data={apiKeys} columns={columns} keyExtractor={(k) => k.id.toString()} />
        </Card>
      ) : (
        <Card className="p-8 text-center text-gray-500">No API keys yet.</Card>
      )}

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setNewKeyValue(null); }} title="Create API Key">
        {newKeyValue ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Copy this key now. You won&apos;t be able to see it again.
            </p>
            <div className="rounded-lg bg-gray-100 p-3 font-mono text-sm break-all">{newKeyValue}</div>
            <Button onClick={() => { navigator.clipboard.writeText(newKeyValue); toast.success('Copied!'); }}>
              Copy to Clipboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              label="Expires in days (optional)"
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                Create
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
