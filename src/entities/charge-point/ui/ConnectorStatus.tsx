import { Badge } from '@shared/ui';
import { cn, getConnectorStatusLabel } from '@shared/lib';
import { AlertCircle, Circle, Pause, Lock, BatteryCharging, Clock, Zap } from 'lucide-react';

interface ConnectorStatusProps {
  status: string;
  errorCode?: string | null;
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const statusIcons: Record<string, React.ElementType> = {
  Available: Circle,
  Preparing: Clock,
  Charging: BatteryCharging,
  SuspendedEV: Pause,
  SuspendedEVSE: Pause,
  Finishing: Clock,
  Reserved: Lock,
  Unavailable: Circle,
  Faulted: AlertCircle,
};

const statusColors: Record<string, string> = {
  Available: 'text-emerald-500',
  Preparing: 'text-amber-500',
  Charging: 'text-blue-500 animate-pulse',
  SuspendedEV: 'text-orange-500',
  SuspendedEVSE: 'text-orange-500',
  Finishing: 'text-amber-500',
  Reserved: 'text-violet-500',
  Unavailable: 'text-slate-500',
  Faulted: 'text-red-500',
};

const badgeVariants: Record<string, 'success' | 'warning' | 'info' | 'error' | 'violet' | 'slate' | 'orange'> = {
  Available: 'success',
  Preparing: 'warning',
  Charging: 'info',
  SuspendedEV: 'orange',
  SuspendedEVSE: 'orange',
  Finishing: 'warning',
  Reserved: 'violet',
  Unavailable: 'slate',
  Faulted: 'error',
};

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function ConnectorStatus({ 
  status, 
  errorCode, 
  showLabel = true,
  size = 'default',
  className 
}: ConnectorStatusProps) {
  const Icon = statusIcons[status] || Circle;
  const iconColor = statusColors[status] || 'text-slate-500';
  const label = getConnectorStatusLabel(status);
  const badgeVariant = badgeVariants[status] || 'slate';

  if (showLabel) {
    return (
      <Badge variant={badgeVariant} className={cn('gap-1.5', className)}>
        {status === 'Charging' ? (
          <Zap className={cn(sizeClasses[size], 'animate-pulse')} />
        ) : (
          <Icon className={sizeClasses[size]} />
        )}
        <span>{label}</span>
        {errorCode && <span className="text-red-400">({errorCode})</span>}
      </Badge>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {status === 'Charging' ? (
        <Zap className={cn(sizeClasses[size], iconColor)} />
      ) : (
        <Icon className={cn(sizeClasses[size], iconColor)} />
      )}
      {errorCode && <AlertCircle className="h-3 w-3 text-red-500" />}
    </div>
  );
}

interface ConnectorIndicatorProps {
  connectorId: number;
  status: string;
  errorCode?: string | null;
  className?: string;
}

export function ConnectorIndicator({ 
  connectorId, 
  status, 
  errorCode,
  className 
}: ConnectorIndicatorProps) {
  const Icon = status === 'Charging' ? Zap : statusIcons[status] || Circle;
  const iconColor = statusColors[status] || 'text-slate-500';
  const label = getConnectorStatusLabel(status);

  return (
    <div className={cn(
      'flex items-center gap-2 p-2 rounded-lg bg-muted/50',
      className
    )}>
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full bg-background',
        status === 'Faulted' && 'ring-2 ring-red-500'
      )}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium">Разъём {connectorId}</span>
        <span className="text-xs text-muted-foreground truncate">
          {label}
          {errorCode && ` • ${errorCode}`}
        </span>
      </div>
    </div>
  );
}
