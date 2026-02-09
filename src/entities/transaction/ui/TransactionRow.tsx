import { useState } from 'react';
import { 
  Badge, 
  Button,
  TableCell,
  TableRow as UITableRow,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shared/ui';
import { 
  cn, 
  formatEnergy, 
  formatCurrency, 
  formatDuration, 
  formatDate,
  getTransactionStatusLabel,
  getTransactionStatusColor
} from '@shared/lib';
import { Zap, CheckCircle2, XCircle, Square, AlertTriangle } from 'lucide-react';
import type { TransactionDto } from '@shared/api';
import { useForceStopTransaction } from '../api/queries';

interface TransactionStatusBadgeProps {
  status: string;
  className?: string;
}

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
  const label = getTransactionStatusLabel(status);
  const color = getTransactionStatusColor(status);
  
  const Icon = status === 'Active' ? Zap : status === 'Completed' ? CheckCircle2 : XCircle;
  
  const variants: Record<string, 'success' | 'info' | 'error' | 'slate'> = {
    emerald: 'success',
    blue: 'info',
    red: 'error',
    slate: 'slate',
  };

  return (
    <Badge variant={variants[color] || 'slate'} className={cn('gap-1', className)}>
      <Icon className={cn('h-3 w-3', status === 'Active' && 'animate-pulse')} />
      {label}
    </Badge>
  );
}

interface TransactionRowProps {
  transaction: TransactionDto;
  onClick?: () => void;
  className?: string;
  showForceStop?: boolean;
}

export function TransactionRow({ transaction, onClick, className, showForceStop = true }: TransactionRowProps) {
  const [forceStopOpen, setForceStopOpen] = useState(false);
  const forceStop = useForceStopTransaction();

  const { 
    id, 
    charge_point_id, 
    connector_id, 
    id_tag, 
    status, 
    started_at, 
    stopped_at,
    energy_consumed_wh,
    total_cost,
    currency
  } = transaction;

  // Calculate duration
  const start = new Date(started_at);
  const end = stopped_at ? new Date(stopped_at) : new Date();
  const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

  const handleForceStop = () => {
    forceStop.mutate(id, {
      onSuccess: () => setForceStopOpen(false),
    });
  };

  const isActive = status === 'Active';

  // Table Row variant for use in tables
  return (
    <UITableRow className={cn('cursor-pointer hover:bg-muted/50', className)} onClick={onClick}>
      <TableCell className="font-mono">#{id}</TableCell>
      <TableCell>
        <div>
          <p className="text-sm font-medium">{charge_point_id}</p>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">#{connector_id}</span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs">{id_tag}</span>
      </TableCell>
      <TableCell>
        <div className="text-xs">
          <p>{formatDate(started_at)}</p>
          {durationSeconds > 0 && (
            <p className="text-muted-foreground">{formatDuration(durationSeconds)}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {stopped_at ? (
          <div className="text-xs">
            <p>{formatDate(stopped_at)}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatEnergy(energy_consumed_wh || 0)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {total_cost ? formatCurrency(total_cost, currency || 'UZS') : '—'}
      </TableCell>
      <TableCell>
        <TransactionStatusBadge status={status} />
      </TableCell>
      <TableCell>
        {showForceStop && isActive && (
          <AlertDialog open={forceStopOpen} onOpenChange={setForceStopOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setForceStopOpen(true);
                }}
              >
                <Square className="h-3 w-3 mr-1" />
                Force Stop
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Принудительная остановка транзакции
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>Вы уверены, что хотите принудительно остановить транзакцию #{id}?</p>
                  <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-md p-3 mt-2">
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      <strong>⚠️ Внимание:</strong> Эта операция остановит транзакцию только в базе данных.
                      Зарядная станция продолжит заряжать. Используйте RemoteStopTransaction для остановки через станцию.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleForceStop}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={forceStop.isPending}
                >
                  {forceStop.isPending ? 'Остановка...' : 'Да, остановить'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
    </UITableRow>
  );
}
