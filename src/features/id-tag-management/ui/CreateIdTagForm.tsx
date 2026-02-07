import { useState } from 'react';
import type { FormEvent } from 'react';
import { useCreateIdTag } from '@entities/id-tag';
import { Button, Input, Modal } from '@shared/ui';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateIdTagForm({ open, onClose }: Props) {
  const [idTag, setIdTag] = useState('');
  const [parentIdTag, setParentIdTag] = useState('');
  const [maxActiveTransactions, setMaxActiveTransactions] = useState('1');

  const mutation = useCreateIdTag();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      {
        id_tag: idTag,
        parent_id_tag: parentIdTag || undefined,
        max_active_transactions: Number(maxActiveTransactions),
      },
      {
        onSuccess: () => {
          toast.success('ID Tag created');
          onClose();
          setIdTag('');
          setParentIdTag('');
        },
        onError: () => toast.error('Failed to create ID Tag'),
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Create ID Tag">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ID Tag"
          value={idTag}
          onChange={(e) => setIdTag(e.target.value)}
          required
        />
        <Input
          label="Parent ID Tag (optional)"
          value={parentIdTag}
          onChange={(e) => setParentIdTag(e.target.value)}
        />
        <Input
          label="Max Active Transactions"
          type="number"
          value={maxActiveTransactions}
          onChange={(e) => setMaxActiveTransactions(e.target.value)}
          min={1}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
