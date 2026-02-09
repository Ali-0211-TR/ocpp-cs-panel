import { useParams, useNavigate } from 'react-router-dom';
import { useChargePoint, useChargePointConnectors, ConnectorStatus } from '@entities/charge-point';
import { useTransactions, TransactionRow } from '@entities/transaction';
import { PageHeader } from '@widgets/layout';
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
  Settings, 
  Power, 
  Zap,
  MapPin,
  Clock,
  Cpu
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
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </Button>
            {chargePoint.is_online && (
              <Button variant="destructive">
                <Power className="h-4 w-4 mr-2" />
                Перезагрузить
              </Button>
            )}
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

            <div>
              <p className="text-sm text-muted-foreground mb-2">Серийный номер</p>
              <p>{chargePoint.serial_number || 'Нет данных'}</p>
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
                {(connectors as ConnectorDto[]).map((connector) => (
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
                    <p className="text-sm text-muted-foreground">
                      {connector.error_code || 'Нет ошибок'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Transactions, Events, etc. */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          <TabsTrigger value="events">События</TabsTrigger>
          <TabsTrigger value="diagnostics">Диагностика</TabsTrigger>
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

        <TabsContent value="events" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                История событий будет доступна в следующей версии
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Диагностика будет доступна в следующей версии
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
