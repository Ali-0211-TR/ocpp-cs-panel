import { Badge } from '@shared/ui';
import { cn } from '@shared/lib';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useWsStatus } from '../model/wsStore';

interface WsStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function WsStatusIndicator({ className, showLabel = true }: WsStatusIndicatorProps) {
  const status = useWsStatus();

  const config = {
    connected: {
      icon: Wifi,
      label: 'Подключён',
      variant: 'success' as const,
      animate: false,
    },
    connecting: {
      icon: Loader2,
      label: 'Подключение...',
      variant: 'warning' as const,
      animate: true,
    },
    disconnected: {
      icon: WifiOff,
      label: 'Отключён',
      variant: 'error' as const,
      animate: false,
    },
    error: {
      icon: WifiOff,
      label: 'Ошибка',
      variant: 'error' as const,
      animate: false,
    },
  };

  const { icon: Icon, label, variant, animate } = config[status];

  if (showLabel) {
    return (
      <Badge variant={variant} className={cn('gap-1.5', className)}>
        <Icon className={cn('h-3 w-3', animate && 'animate-spin')} />
        <span>{label}</span>
      </Badge>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Icon className={cn(
        'h-4 w-4',
        animate && 'animate-spin',
        status === 'connected' && 'text-emerald-500',
        status === 'connecting' && 'text-amber-500',
        (status === 'disconnected' || status === 'error') && 'text-red-500'
      )} />
    </div>
  );
}
