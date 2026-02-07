import { useResetChargePoint } from '@entities/charge-point';
import type { CommandResponse } from '@entities/charge-point';
import { Button } from '@shared/ui';
import toast from 'react-hot-toast';

interface Props {
  chargePointId: string;
  type?: 'Hard' | 'Soft';
}

export function ResetButton({ chargePointId, type = 'Soft' }: Props) {
  const mutation = useResetChargePoint();

  const handleClick = () => {
    mutation.mutate(
      { cpId: chargePointId, data: { type } },
      {
        onSuccess: (res: CommandResponse) => toast.success(`Reset: ${res.status}`),
        onError: () => toast.error('Reset failed'),
      },
    );
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleClick} loading={mutation.isPending}>
      {type} Reset
    </Button>
  );
}
