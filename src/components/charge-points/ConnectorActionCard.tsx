import { useState, useEffect } from 'react';
import {
  useRemoteStartTransaction,
  useRemoteStopTransaction,
  useUnlockConnector,
  useChangeAvailability,
  ConnectorStatus,
} from '@entities/charge-point';
import { useIdTags } from '@entities/id-tag';
import { useForceStopTransaction } from '@entities/transaction';
import type { ConnectorDto, TransactionDto } from '@shared/api';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Separator,
} from '@shared/ui';
import {
  Play,
  Square,
  Unlock,
  Zap,
  Clock,
  User,
  Hash,
  ToggleLeft,
  ToggleRight,
  Timer,
  BatteryCharging,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn, formatDate, formatDurationFromStart, formatEnergy } from '@shared/lib';
import { toast } from 'sonner';

interface ConnectorActionCardProps {
  chargePointId: string;
  connector: ConnectorDto;
  isOnline: boolean;
  activeTransaction?: TransactionDto;
}

/**
 * Live elapsed-time counter. Re-renders every second while charging.
 */
function LiveTimer({ startedAt }: { startedAt: string }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <>{formatDurationFromStart(startedAt)}</>;
}

export function ConnectorActionCard({
  chargePointId,
  connector,
  isOnline,
  activeTransaction,
}: ConnectorActionCardProps) {
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [selectedIdTag, setSelectedIdTag] = useState('');

  const { data: idTagsData } = useIdTags({ page: 1, limit: 100 });
  const remoteStartMutation = useRemoteStartTransaction();
  const remoteStopMutation = useRemoteStopTransaction();
  const forceStopMutation = useForceStopTransaction();
  const unlockMutation = useUnlockConnector();
  const changeAvailMutation = useChangeAvailability();

  const idTags = idTagsData?.items || [];

  // Status helpers
  const isCharging = connector.status === 'Charging';
  const isAvailable = connector.status === 'Available';
  const isPreparing = connector.status === 'Preparing';
  const isFinishing = connector.status === 'Finishing';
  const isSuspended = connector.status === 'SuspendedEV' || connector.status === 'SuspendedEVSE';
  const isUnavailable = connector.status === 'Unavailable';
  const isFaulted = connector.status === 'Faulted';

  const hasActiveSession = !!activeTransaction;
  const canStart = isOnline && (isAvailable || isPreparing);
  const canStop = isOnline && hasActiveSession;
  const canForceStop = hasActiveSession && !isOnline;
  const canUnlock = isOnline && !isAvailable && !isCharging && connector.id > 0;

  // ─── Handlers ───────────────────────────────────────────────

  const handleStart = async () => {
    if (!selectedIdTag) {
      toast.error('Выберите ID карты');
      return;
    }
    try {
      await remoteStartMutation.mutateAsync({
        chargePointId,
        data: { id_tag: selectedIdTag, connector_id: connector.id },
      });
      setStartDialogOpen(false);
      setSelectedIdTag('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleStop = async () => {
    if (!activeTransaction) return;
    try {
      await remoteStopMutation.mutateAsync({
        chargePointId,
        data: { transaction_id: activeTransaction.id },
      });
      setStopDialogOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleForceStop = async () => {
    if (!activeTransaction) return;
    try {
      await forceStopMutation.mutateAsync(activeTransaction.id);
      setStopDialogOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockMutation.mutateAsync({
        chargePointId,
        data: { connector_id: connector.id },
      });
    } catch {
      // handled
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await changeAvailMutation.mutateAsync({
        chargePointId,
        data: {
          connector_id: connector.id,
          type: isUnavailable ? 'Operative' : 'Inoperative',
        },
      });
    } catch {
      // handled
    }
  };

  // ─── Visual helpers ─────────────────────────────────────────

  const borderColor = isCharging
    ? 'border-blue-500 shadow-blue-500/10 shadow-md'
    : isSuspended
    ? 'border-orange-400 shadow-orange-400/10 shadow-sm'
    : isFaulted
    ? 'border-red-500 shadow-red-500/10 shadow-sm'
    : isAvailable
    ? 'border-emerald-500/40'
    : isUnavailable
    ? 'border-slate-400/30 opacity-60'
    : 'border-border';

  const headerBg = isCharging
    ? 'bg-blue-500/5'
    : isSuspended
    ? 'bg-orange-500/5'
    : isFaulted
    ? 'bg-red-500/5'
    : isAvailable
    ? 'bg-emerald-500/5'
    : '';

  return (
    <>
      <Card className={cn('transition-all border-2', borderColor)}>
        {/* ── Header ────────────────────────────────── */}
        <div className={cn('flex items-center justify-between px-4 py-3 rounded-t-lg', headerBg)}>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm',
                isCharging
                  ? 'bg-blue-500 text-white'
                  : isAvailable
                  ? 'bg-emerald-500 text-white'
                  : isFaulted
                  ? 'bg-red-500 text-white'
                  : isSuspended
                  ? 'bg-orange-400 text-white'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {isCharging ? (
                <BatteryCharging className="h-5 w-5 animate-pulse" />
              ) : (
                connector.id
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">Коннектор #{connector.id}</p>
              <ConnectorStatus
                status={connector.status}
                errorCode={connector.error_code}
                size="sm"
              />
            </div>
          </div>

          {/* Quick actions in header */}
          <div className="flex items-center gap-1.5">
            {canStart && (
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setStartDialogOpen(true)}
              >
                <Play className="h-3.5 w-3.5" />
                Начать
              </Button>
            )}
            {(canStop || canForceStop) && (
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                onClick={() => setStopDialogOpen(true)}
              >
                <Square className="h-3.5 w-3.5" />
                Остановить
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* ── Active charging session ─────────────── */}
          {hasActiveSession && (
            <div className="space-y-3">
              {/* Live stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Hash className="h-3 w-3" />
                    Транзакция
                  </div>
                  <p className="font-bold text-lg">#{activeTransaction!.id}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <User className="h-3 w-3" />
                    Карта
                  </div>
                  <p className="font-bold text-sm truncate">{activeTransaction!.id_tag}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-600 text-xs">
                    <Timer className="h-3 w-3" />
                    Время зарядки
                  </div>
                  <p className="font-bold text-lg text-blue-700">
                    {isCharging || isSuspended ? (
                      <LiveTimer startedAt={activeTransaction!.started_at} />
                    ) : (
                      formatDurationFromStart(activeTransaction!.started_at)
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs">
                    <Zap className="h-3 w-3" />
                    Энергия
                  </div>
                  <p className="font-bold text-lg text-emerald-700">
                    {activeTransaction!.energy_consumed_wh != null
                      ? formatEnergy(activeTransaction!.energy_consumed_wh)
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Session details */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Начало: {formatDate(activeTransaction!.started_at)}
                </span>
                {isCharging && (
                  <Badge variant="info" className="gap-1 text-xs animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Заряжается
                  </Badge>
                )}
                {isSuspended && (
                  <Badge variant="warning" className="gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    Приостановлено
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* ── Idle state / no session ─────────────── */}
          {!hasActiveSession && isOnline && (
            <div className="text-center py-2">
              {isAvailable && (
                <p className="text-sm text-emerald-600 font-medium">✓ Готов к зарядке</p>
              )}
              {isPreparing && (
                <p className="text-sm text-amber-600 font-medium">⏳ Подготовка...</p>
              )}
              {isFinishing && (
                <p className="text-sm text-amber-600 font-medium">⏳ Завершение сессии...</p>
              )}
              {isUnavailable && (
                <p className="text-sm text-muted-foreground">Коннектор отключён</p>
              )}
              {isFaulted && (
                <p className="text-sm text-red-600 font-medium">⚠ Ошибка коннектора</p>
              )}
            </div>
          )}

          {!isOnline && !hasActiveSession && (
            <p className="text-sm text-muted-foreground text-center py-2">Станция офлайн</p>
          )}

          {/* ── Error info ──────────────────────────── */}
          {connector.error_code && connector.error_code !== 'NoError' && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">{connector.error_code}</span>
                {connector.error_info && (
                  <span className="text-red-500 ml-1">— {connector.error_info}</span>
                )}
              </div>
            </div>
          )}

          {/* ── Secondary actions ───────────────────── */}
          {isOnline && (canUnlock || isAvailable || isUnavailable) && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {canUnlock && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={handleUnlock}
                    disabled={unlockMutation.isPending}
                  >
                    <Unlock className="h-3 w-3" />
                    {unlockMutation.isPending ? '...' : 'Разблокировать'}
                  </Button>
                )}
                {(isAvailable || isUnavailable) && !hasActiveSession && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={handleToggleAvailability}
                    disabled={changeAvailMutation.isPending}
                  >
                    {isUnavailable ? (
                      <>
                        <ToggleRight className="h-3 w-3" />
                        {changeAvailMutation.isPending ? '...' : 'Включить'}
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-3 w-3" />
                        {changeAvailMutation.isPending ? '...' : 'Отключить'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Force-stop for offline stations with stuck sessions */}
          {canForceStop && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-xs text-muted-foreground flex-1">
                  Станция офлайн, но транзакция #{activeTransaction!.id} всё ещё активна
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                  onClick={() => setStopDialogOpen(true)}
                >
                  <Square className="h-3 w-3" />
                  Принудительно
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Start Dialog ─────────────────────────────── */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚡ Начать зарядку</DialogTitle>
            <DialogDescription>
              Коннектор #{connector.id} · {chargePointId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID карты *</Label>
              <Select value={selectedIdTag} onValueChange={setSelectedIdTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите карту" />
                </SelectTrigger>
                <SelectContent>
                  {idTags.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      Нет доступных карт
                    </SelectItem>
                  ) : (
                    idTags.map((tag) => (
                      <SelectItem key={tag.id_tag} value={tag.id_tag}>
                        {tag.name ? `${tag.name} (${tag.id_tag})` : tag.id_tag}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleStart}
              disabled={remoteStartMutation.isPending || !selectedIdTag}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {remoteStartMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Запустить зарядку
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Stop Dialog ──────────────────────────────── */}
      <Dialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Остановить зарядку</DialogTitle>
            <DialogDescription>
              Транзакция #{activeTransaction?.id} · Коннектор #{connector.id}
            </DialogDescription>
          </DialogHeader>
          {activeTransaction && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Карта</p>
                  <p className="font-medium">{activeTransaction.id_tag}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Начало</p>
                  <p className="font-medium">{formatDate(activeTransaction.started_at)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Время</p>
                  <p className="font-medium">
                    <LiveTimer startedAt={activeTransaction.started_at} />
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Энергия</p>
                  <p className="font-medium">
                    {activeTransaction.energy_consumed_wh != null
                      ? formatEnergy(activeTransaction.energy_consumed_wh)
                      : '—'}
                  </p>
                </div>
              </div>

              {!isOnline && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-700 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Станция офлайн</p>
                    <p className="text-xs">
                      Команда RemoteStop не может быть отправлена. Вы можете принудительно закрыть
                      транзакцию в базе данных.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setStopDialogOpen(false)}>
              Отмена
            </Button>
            {isOnline ? (
              <Button
                variant="destructive"
                onClick={handleStop}
                disabled={remoteStopMutation.isPending}
              >
                {remoteStopMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Остановить (RemoteStop)
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleForceStop}
                disabled={forceStopMutation.isPending}
              >
                {forceStopMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Закрытие...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Принудительно закрыть
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
