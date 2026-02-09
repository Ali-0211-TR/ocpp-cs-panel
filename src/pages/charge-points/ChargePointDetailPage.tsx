import { useParams, useNavigate } from 'react-router-dom';
import { useChargePoint, useChargePointConnectors, ConnectorStatus } from '@entities/charge-point';
import { useTransactions, TransactionRow } from '@entities/transaction';
import { PageHeader } from '@widgets/layout';
import { ConfigurationTab, CommandsTab } from '@/components/charge-points';
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
} from '@shared/ui';
import { CHARGE_POINT_STATUSES } from '@shared/config';
import { formatDate } from '@shared/lib';
import { 
  ArrowLeft, 
  RefreshCw, 
  Zap,
  MapPin,
  Clock,
  Cpu,
  Activity,
  Settings,
  Terminal,
  FileText
} from 'lucide-react';

export function ChargePointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: chargePoint, isLoading: cpLoading, refetch } = useChargePoint(id!);
  const { data: connectors, isLoading: connectorsLoading } = useChargePointConnectors(id!);
  const { data: transactionsData, isLoading: txLoading } = useTransactions({
    charge_point_id: id,
    page: 1,
    limit: 10,
  });

  const transactions: TransactionDto[] = transactionsData?.items || [];
  const connectorsList: ConnectorDto[] = connectors || chargePoint?.connectors || [];

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

      {/* Status and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Информация о станции</span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID станции</p>
                  <p className="font-medium">{chargePoint.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Модель</p>
                  <p className="font-medium">{chargePoint.model || 'Не указана'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Производитель</p>
                  <p className="font-medium">{chargePoint.vendor || 'Не указан'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Последняя активность</p>
                  <p className="font-medium">
                    {chargePoint.last_heartbeat 
                      ? formatDate(chargePoint.last_heartbeat)
                      : 'Нет данных'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Серийный номер</p>
                <p>{chargePoint.serial_number || 'Нет данных'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Версия прошивки</p>
                <p>{chargePoint.firmware_version || 'Нет данных'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connectors */}
        <Card>
          <CardHeader>
            <CardTitle>Коннекторы</CardTitle>
          </CardHeader>
          <CardContent>
            {connectorsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner />
              </div>
            ) : !connectors || connectors.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет коннекторов
              </p>
            ) : (
              <div className="space-y-3">
                {connectorsList.map((connector) => (
                  <div
                    key={connector.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        Коннектор #{connector.id}
                      </span>
                      <ConnectorStatus status={connector.status} />
                    </div>
                    {connector.error_code && connector.error_code !== 'NoError' && (
                      <p className="text-sm text-destructive">
                        {connector.error_code}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
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
            Команды
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
