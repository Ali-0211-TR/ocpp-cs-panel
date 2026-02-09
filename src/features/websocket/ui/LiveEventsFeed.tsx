import { ScrollArea, Badge } from '@shared/ui';
import { cn, timeAgo } from '@shared/lib';
import { WS_EVENT_TYPES } from '@shared/config';
import { useLatestEvents } from '../model/wsStore';
import type { WsEvent, WsEventType } from '@shared/api';
import { 
  Wifi, 
  WifiOff, 
  Zap, 
  ZapOff, 
  Activity, 
  AlertCircle,
  CheckCircle,
  Clock,
  Gauge
} from 'lucide-react';

interface LiveEventsFeedProps {
  maxEvents?: number;
  className?: string;
}

const eventIcons: Record<WsEventType, React.ElementType> = {
  charge_point_connected: Wifi,
  charge_point_disconnected: WifiOff,
  boot_notification: Activity,
  heartbeat_received: Activity,
  connector_status_changed: Gauge,
  transaction_started: Zap,
  transaction_stopped: ZapOff,
  meter_values: Clock,
  authorization_result: CheckCircle,
  error: AlertCircle,
};

const eventVariants: Record<string, 'success' | 'warning' | 'info' | 'error' | 'slate' | 'violet'> = {
  emerald: 'success',
  amber: 'warning',
  blue: 'info',
  red: 'error',
  slate: 'slate',
  violet: 'violet',
};

function EventItem({ event }: { event: WsEvent }) {
  const Icon = eventIcons[event.event_type] || Activity;
  const config = WS_EVENT_TYPES[event.event_type];
  const variant = eventVariants[config?.color || 'slate'] || 'slate';

  // Extract meaningful data from event
  const getEventDescription = () => {
    const data = event.data as Record<string, unknown>;
    switch (event.event_type) {
      case 'charge_point_connected':
        return 'подключилась';
      case 'charge_point_disconnected':
        return data.reason ? `отключилась: ${data.reason}` : 'отключилась';
      case 'boot_notification':
        return `загружена ${data.vendor || ''} ${data.model || ''}`.trim();
      case 'heartbeat_received':
        return 'heartbeat';
      case 'connector_status_changed':
        return `разъём ${data.connector_id}: ${data.status}`;
      case 'transaction_started':
        return `транзакция #${data.transaction_id} началась`;
      case 'transaction_stopped':
        return `транзакция #${data.transaction_id} завершена`;
      case 'meter_values':
        return `показания счётчика`;
      case 'authorization_result':
        return `авторизация ${data.id_tag}: ${data.status}`;
      case 'error':
        return String(data.message || 'Неизвестная ошибка');
      default:
        return event.event_type;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg">
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
        variant === 'success' && 'bg-emerald-500/20 text-emerald-500',
        variant === 'warning' && 'bg-amber-500/20 text-amber-500',
        variant === 'info' && 'bg-blue-500/20 text-blue-500',
        variant === 'error' && 'bg-red-500/20 text-red-500',
        variant === 'slate' && 'bg-slate-500/20 text-slate-400',
        variant === 'violet' && 'bg-violet-500/20 text-violet-500'
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={variant} className="text-xs">
            {config?.label || event.event_type}
          </Badge>
          <span className="text-xs text-muted-foreground">{timeAgo(event.timestamp)}</span>
        </div>
        <p className="text-sm mt-1">
          <span className="font-medium">{event.charge_point_id}</span>
          <span className="text-muted-foreground"> {getEventDescription()}</span>
        </p>
      </div>
    </div>
  );
}

export function LiveEventsFeed({ maxEvents = 20, className }: LiveEventsFeedProps) {
  const events = useLatestEvents(maxEvents);

  if (events.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-muted-foreground', className)}>
        <Activity className="h-5 w-5 mr-2 animate-pulse" />
        <span>Ожидание событий...</span>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('h-[400px]', className)}>
      <div className="space-y-1 p-1">
        {events.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
    </ScrollArea>
  );
}
