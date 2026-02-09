import { useState, useEffect } from 'react';
import { Card, CardContent, Badge, Button } from '@shared/ui';
import { cn, formatEnergy, formatCurrency, formatDurationFromStart, getSecondsSince } from '@shared/lib';
import { Zap, Clock, CreditCard, Square, Fuel } from 'lucide-react';
import type { TransactionDto } from '@shared/api';

interface ActiveSessionCardProps {
  transaction: TransactionDto;
  onStop?: (transactionId: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function ActiveSessionCard({ 
  transaction, 
  onStop,
  isLoading,
  className 
}: ActiveSessionCardProps) {
  const [duration, setDuration] = useState(formatDurationFromStart(transaction.started_at));
  const [seconds, setSeconds] = useState(getSecondsSince(transaction.started_at));

  // Update duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatDurationFromStart(transaction.started_at));
      setSeconds(getSecondsSince(transaction.started_at));
    }, 1000);

    return () => clearInterval(interval);
  }, [transaction.started_at]);

  const energyWh = transaction.energy_consumed_wh || 
    (transaction.meter_stop ? transaction.meter_stop - transaction.meter_start : 0);

  // Calculate estimated cost if we have tariff info
  const estimatedCost = transaction.total_cost;

  return (
    <Card className={cn(
      'border-blue-500/50 bg-blue-500/5 transition-all',
      className
    )}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="info" className="gap-1">
                <Zap className="h-3 w-3 animate-pulse" />
                Зарядка
              </Badge>
              <span className="text-sm font-mono text-muted-foreground">
                #{transaction.id}
              </span>
            </div>
            <p className="text-sm">
              <span className="font-medium">{transaction.charge_point_id}</span>
              <span className="text-muted-foreground"> • Разъём {transaction.connector_id}</span>
            </p>
          </div>
          {onStop && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onStop(transaction.id)}
              disabled={isLoading}
            >
              <Square className="h-3 w-3 mr-1" />
              Стоп
            </Button>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Duration */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">Время</span>
            </div>
            <p className="text-lg font-semibold tabular-nums">{duration}</p>
          </div>

          {/* Energy */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Fuel className="h-3.5 w-3.5" />
              <span className="text-xs">Энергия</span>
            </div>
            <p className="text-lg font-semibold tabular-nums">
              {formatEnergy(energyWh)}
            </p>
          </div>

          {/* Cost */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="text-xs">Стоимость</span>
            </div>
            <p className="text-lg font-semibold tabular-nums">
              {estimatedCost ? formatCurrency(estimatedCost, transaction.currency || 'UZS') : '—'}
            </p>
          </div>
        </div>

        {/* Progress bar (charging animation) */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all animate-pulse"
              style={{ 
                width: `${Math.min(100, (seconds / 3600) * 100)}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>ID карты: {transaction.id_tag}</span>
            <span>Начало: {new Date(transaction.started_at).toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
