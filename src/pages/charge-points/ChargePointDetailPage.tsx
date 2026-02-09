import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChargePoint, useChargePointConnectors, useCreateConnector, useDeleteConnector } from '@entities/charge-point';
import { useTransactions, useActiveTransactions, TransactionRow } from '@entities/transaction';
import { PageHeader } from '@widgets/layout';
import { ConfigurationTab, CommandsTab, ConnectorActionCard } from '@/components/charge-points';
import type { TransactionDto, ConnectorDto } from '@shared/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Input,
} from '@shared/ui';
import { CHARGE_POINT_STATUSES } from '@shared/config';
import { formatDate } from '@shared/lib';
import {
  ArrowLeft,
  RefreshCw,
  Zap,
  Clock,
  Cpu,
  Activity,
  Settings,
  Terminal,
  FileText,
  Plug,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
} from 'lucide-react';

export function ChargePointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: chargePoint, isLoading: cpLoading, refetch } = useChargePoint(id!);
  const { data: connectors, isLoading: connectorsLoading } = useChargePointConnectors(id!);
  const { data: activeTransactions } = useActiveTransactions(id!);
  const { data: transactionsData, isLoading: txLoading } = useTransactions({
    charge_point_id: id,
    page: 1,
    limit: 10,
  });

  const transactions: TransactionDto[] = transactionsData?.items || [];
  const connectorsList: ConnectorDto[] = connectors || chargePoint?.connectors || [];
  const activeTransactionsList: TransactionDto[] = Array.isArray(activeTransactions) ? activeTransactions : [];

  // Connector management
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newConnectorId, setNewConnectorId] = useState('');
  const createConnectorMutation = useCreateConnector();
  const deleteConnectorMutation = useDeleteConnector();

  // Map active transactions to their connector IDs for quick lookup
  const activeTransactionByConnector = new Map<number, TransactionDto>();
  activeTransactionsList.forEach((tx) => {
    activeTransactionByConnector.set(tx.connector_id, tx);
  });

  const handleAddConnector = async () => {
    const connectorId = parseInt(newConnectorId, 10);
    if (isNaN(connectorId) || connectorId < 1) {
      return;
    }
    try {
      await createConnectorMutation.mutateAsync({
        chargePointId: id!,
        connectorId,
      });
      setAddDialogOpen(false);
      setNewConnectorId('');
    } catch {
      // Error handled by mutation / toast
    }
  };

  const handleDeleteConnector = async (connectorId: number) => {
    try {
      await deleteConnectorMutation.mutateAsync({
        chargePointId: id!,
        connectorId,
      });
    } catch {
      // Error handled by mutation / toast
    }
  };

  if (cpLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!chargePoint) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-lg font-medium">Станция не найдена</p>
        <Button variant="link" onClick={() => navigate('/charge-points')}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  const statusKey = chargePoint.is_online ? 'ONLINE' : 'OFFLINE';
  const statusConfig = CHARGE_POINT_STATUSES[statusKey];
  const chargingCount = activeTransactionsList.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={chargePoint.vendor || chargePoint.id}
        description={`ID: ${chargePoint.id}`}
        breadcrumbs={[
          { label: 'Зарядные станции', href: '/charge-points' },
          { label: chargePoint.vendor || chargePoint.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* ── Compact station info bar ─────────────────── */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Online badge */}
            <Badge
              variant={statusConfig.variant}
              className="gap-1.5 text-sm px-3 py-1"
            >
              {chargePoint.is_online ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              {statusConfig.label}
            </Badge>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            {/* Quick info items */}
            <div className="flex items-center gap-2 text-sm">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Модель:</span>
              <span className="font-medium">{chargePoint.model || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Производитель:</span>
              <span className="font-medium">{chargePoint.vendor || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Последний heartbeat:</span>
              <span className="font-medium">
                {chargePoint.last_heartbeat
                  ? formatDate(chargePoint.last_heartbeat)
                  : '—'}
              </span>
            </div>

            {chargingCount > 0 && (
              <>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <Badge variant="info" className="gap-1 animate-pulse">
                  <Zap className="h-3 w-3" />
                  {chargingCount} активн. {chargingCount === 1 ? 'сессия' : 'сессий'}
                </Badge>
              </>
            )}

            {chargePoint.serial_number && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">S/N:</span>
                <span className="font-mono text-xs">{chargePoint.serial_number}</span>
              </div>
            )}
            {chargePoint.firmware_version && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">FW:</span>
                <span className="font-mono text-xs">{chargePoint.firmware_version}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Connectors — Primary section ─────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Коннекторы</h2>
            <Badge variant="outline" className="ml-1">
              {connectorsList.filter((c) => c.id > 0).length}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        </div>

        {connectorsLoading ? (
          <div className="flex items-center justify-center h-32">
            <Spinner />
          </div>
        ) : connectorsList.filter((c) => c.id > 0).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Plug className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Нет данных о коннекторах</p>
              <p className="text-sm">Коннекторы появятся после первого подключения станции</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {connectorsList
              .filter((c) => c.id > 0)
              .map((connector) => (
                <ConnectorActionCard
                  key={connector.id}
                  chargePointId={id!}
                  connector={connector}
                  isOnline={chargePoint.is_online}
                  activeTransaction={activeTransactionByConnector.get(connector.id)}
                  onDelete={handleDeleteConnector}
                  isDeleting={deleteConnectorMutation.isPending}
                />
              ))}
          </div>
        )}
      </div>

      {/* ── Add connector dialog ─────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить коннектор</DialogTitle>
            <DialogDescription>
              Укажите номер коннектора. Обычно нумерация начинается с 1.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="connector-id">Номер коннектора</Label>
              <Input
                id="connector-id"
                type="number"
                min={1}
                placeholder="Например: 2"
                value={newConnectorId}
                onChange={(e) => setNewConnectorId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddConnector();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleAddConnector}
              disabled={createConnectorMutation.isPending || !newConnectorId}
            >
              {createConnectorMutation.isPending ? 'Добавление...' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Tabs ─────────────────────────────────────── */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions" className="gap-2">
            <FileText className="h-4 w-4" />
            Транзакции
          </TabsTrigger>
          <TabsTrigger value="configuration" className="gap-2">
            <Settings className="h-4 w-4" />
            Конфигурация
          </TabsTrigger>
          <TabsTrigger value="commands" className="gap-2">
            <Terminal className="h-4 w-4" />
            Доп. команды
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Activity className="h-4 w-4" />
            Мониторинг
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Последние транзакции</CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Spinner />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Нет транзакций
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Коннектор</TableHead>
                      <TableHead>Начало</TableHead>
                      <TableHead>Окончание</TableHead>
                      <TableHead>Энергия</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TransactionRow key={tx.id} transaction={tx} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="mt-4">
          <ConfigurationTab chargePointId={id!} />
        </TabsContent>

        <TabsContent value="commands" className="mt-4">
          <CommandsTab
            chargePointId={id!}
            connectors={connectorsList}
            isOnline={chargePoint.is_online}
          />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Мониторинг в реальном времени</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Live мониторинг MeterValues и Heartbeat</p>
              <p className="text-sm">Подключение к WebSocket для получения данных...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
