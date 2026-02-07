import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRemoteStart } from '@entities/charge-point';
import type { CommandResponse } from '@entities/charge-point';
import { Button, Input, Modal } from '@shared/ui';
import toast from 'react-hot-toast';

interface Props {
  chargePointId: string;
  open: boolean;
  onClose: () => void;
}

export function RemoteStartForm({ chargePointId, open, onClose }: Props) {
  const [idTag, setIdTag] = useState('');
  const [connectorId, setConnectorId] = useState('');

  const mutation = useRemoteStart();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      {
        cpId: chargePointId,
        data: {
          id_tag: idTag,
          connector_id: connectorId ? Number(connectorId) : undefined,
        },
      },
      {
        onSuccess: (res: CommandResponse) => {
          toast.success(`Remote start: ${res.status}`);
          onClose();
        },
        onError: () => toast.error('Remote start failed'),
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Remote Start Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ID Tag"
          value={idTag}
          onChange={(e) => setIdTag(e.target.value)}
          required
        />
        <Input
          label="Connector ID (optional)"
          type="number"
          value={connectorId}
          onChange={(e) => setConnectorId(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Start
          </Button>
        </div>
      </form>
    </Modal>
  );
}
