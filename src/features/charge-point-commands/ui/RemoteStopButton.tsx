import { useRemoteStop } from '@entities/charge-point';
import type { CommandResponse } from '@entities/charge-point';
import { Button } from '@shared/ui';
import toast from 'react-hot-toast';

interface Props {
  chargePointId: string;
  transactionId: number;
}

export function RemoteStopButton({ chargePointId, transactionId }: Props) {
  const mutation = useRemoteStop();

  const handleClick = () => {
    mutation.mutate(
      { cpId: chargePointId, data: { transaction_id: transactionId } },
      {
        onSuccess: (res: CommandResponse) => toast.success(`Remote stop: ${res.status}`),
        onError: () => toast.error('Remote stop failed'),
      },
    );
  };

  return (
    <Button variant="danger" size="sm" onClick={handleClick} loading={mutation.isPending}>
      Stop
    </Button>
  );
}
