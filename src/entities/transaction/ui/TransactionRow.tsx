import { Badge } from '@shared/ui';
import { 
  cn, 
  formatEnergy, 
  formatCurrency, 
  formatDuration, 
  formatDate,
  getTransactionStatusLabel,
  getTransactionStatusColor
} from '@shared/lib';
import { Zap, CheckCircle2, XCircle } from 'lucide-react';
import type { TransactionDto } from '@shared/api';

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
}

export function TransactionRow({ transaction, onClick, className }: TransactionRowProps) {
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

  return (
    <div 
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* ID & Status */}
      <div className="flex items-center gap-3 min-w-[180px]">
        <span className="font-mono text-sm text-muted-foreground">#{id}</span>
        <TransactionStatusBadge status={status} />
      </div>

      {/* Charge Point Info */}
      <div className="flex-1 min-w-[150px]">
        <p className="text-sm font-medium">{charge_point_id}</p>
        <p className="text-xs text-muted-foreground">Разъём {connector_id}</p>
      </div>

      {/* ID Tag */}
      <div className="min-w-[120px]">
        <p className="text-sm font-mono truncate">{id_tag}</p>
      </div>

      {/* Duration */}
      <div className="min-w-[80px] text-right">
        <p className="text-sm tabular-nums">{formatDuration(durationSeconds)}</p>
      </div>

      {/* Energy */}
      <div className="min-w-[100px] text-right">
        <p className="text-sm font-medium tabular-nums">
          {formatEnergy(energy_consumed_wh || 0)}
        </p>
      </div>

      {/* Cost */}
      <div className="min-w-[100px] text-right">
        <p className="text-sm font-medium tabular-nums">
          {total_cost ? formatCurrency(total_cost, currency || 'UZS') : '—'}
        </p>
      </div>

      {/* Date */}
      <div className="min-w-[150px] text-right text-muted-foreground">
        <p className="text-xs">{formatDate(started_at)}</p>
      </div>
    </div>
  );
}
