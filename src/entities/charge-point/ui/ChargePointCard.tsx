import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@shared/ui';
import { cn, timeAgo } from '@shared/lib';
import { ChevronRight, Wifi, WifiOff, Settings, Power } from 'lucide-react';
import { ConnectorIndicator } from './ConnectorStatus';
import type { ChargePointDto } from '@shared/api';

interface ChargePointCardProps {
  chargePoint: ChargePointDto;
  onCommand?: (chargePointId: string, command: string) => void;
  className?: string;
}

export function ChargePointCard({ 
  chargePoint, 
  onCommand,
  className 
}: ChargePointCardProps) {
  const { id, vendor, model, is_online, connectors, last_heartbeat } = chargePoint;

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      !is_online && 'opacity-75',
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">{id}</CardTitle>
              <Badge variant={is_online ? 'success' : 'error'} className="gap-1">
                {is_online ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Онлайн
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Офлайн
                  </>
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {vendor && model ? `${vendor} ${model}` : 'Неизвестная модель'}
            </p>
          </div>
          <Link to={`/charge-points/${id}`}>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connectors */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Разъёмы ({connectors.length})
          </h4>
          <div className="grid gap-2">
            {connectors.map((connector) => (
              <ConnectorIndicator
                key={connector.id}
                connectorId={connector.id}
                status={connector.status}
                errorCode={connector.error_code}
              />
            ))}
          </div>
        </div>

        {/* Last heartbeat */}
        {last_heartbeat && (
          <div className="text-xs text-muted-foreground">
            Последний heartbeat: {timeAgo(last_heartbeat)}
          </div>
        )}

        {/* Quick actions */}
        {onCommand && is_online && (
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onCommand(id, 'reset')}
            >
              <Power className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onCommand(id, 'configure')}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
