import { useState } from 'react';
import { useIdTags, useDeleteIdTag, useBlockIdTag, useUnblockIdTag } from '@entities/id-tag';
import type { IdTagDto } from '@entities/id-tag';
import { CreateIdTagForm } from '@features/id-tag-management';
import { Card, Spinner, Table, Badge, Button } from '@shared/ui';
import { formatDate } from '@shared/lib';
import toast from 'react-hot-toast';

export function IdTagsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: idTagsData, isLoading } = useIdTags();
  const deleteMutation = useDeleteIdTag();
  const blockMutation = useBlockIdTag();
  const unblockMutation = useUnblockIdTag();

  const handleDelete = (idTag: string) => {
    deleteMutation.mutate(idTag, {
      onSuccess: () => toast.success('ID Tag deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  const handleBlock = (idTag: string) => {
    blockMutation.mutate(idTag, {
      onSuccess: () => toast.success('ID Tag blocked'),
    });
  };

  const handleUnblock = (idTag: string) => {
    unblockMutation.mutate(idTag, {
      onSuccess: () => toast.success('ID Tag unblocked'),
    });
  };

  const columns = [
    { key: 'id_tag', header: 'ID Tag', render: (tag: IdTagDto) => <span className="font-mono">{tag.id_tag}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (tag: IdTagDto) => (
        <Badge variant={tag.status === 'Accepted' ? 'green' : tag.status === 'Blocked' ? 'red' : 'gray'}>
          {tag.status}
        </Badge>
      ),
    },
    { key: 'parent', header: 'Parent', render: (tag: IdTagDto) => tag.parent_id_tag ?? '—' },
    { key: 'expiry', header: 'Expiry', render: (tag: IdTagDto) => tag.expiry_date ? formatDate(tag.expiry_date) : '—' },
    { key: 'created', header: 'Created', render: (tag: IdTagDto) => formatDate(tag.created_at) },
    {
      key: 'actions',
      header: 'Actions',
      render: (tag: IdTagDto) => (
        <div className="flex gap-1">
          {tag.status === 'Blocked' ? (
            <Button size="sm" variant="secondary" onClick={() => handleUnblock(tag.id_tag)}>
              Unblock
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => handleBlock(tag.id_tag)}>
              Block
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => handleDelete(tag.id_tag)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <Spinner />;

  const idTags = idTagsData?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ID Tags</h1>
        <Button onClick={() => setCreateOpen(true)}>Create ID Tag</Button>
      </div>

      {idTags.length > 0 ? (
        <Card>
          <Table data={idTags} columns={columns} keyExtractor={(tag) => tag.id_tag} />
        </Card>
      ) : (
        <Card className="p-8 text-center text-gray-500">No ID tags yet.</Card>
      )}

      <CreateIdTagForm open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
