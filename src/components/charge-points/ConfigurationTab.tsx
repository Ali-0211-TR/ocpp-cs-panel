import { useState } from 'react';
import { 
  useChargePointConfiguration, 
  useChangeConfiguration 
} from '@entities/charge-point';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@shared/ui';
import { RefreshCw, Lock, Pencil, Check, X, AlertCircle } from 'lucide-react';

interface ConfigurationTabProps {
  chargePointId: string;
}

export function ConfigurationTab({ chargePointId }: ConfigurationTabProps) {
  const { data, isLoading, isError, error, refetch, isFetching } = useChargePointConfiguration(chargePointId);
  const changeConfig = useChangeConfiguration();
  
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (key: string, currentValue: string | null | undefined) => {
    setEditingKey(key);
    setEditValue(currentValue || '');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const saveEdit = async (key: string) => {
    await changeConfig.mutateAsync({
      chargePointId,
      data: { key, value: editValue },
    });
    setEditingKey(null);
    setEditValue('');
  };

  // Group configuration keys by category
  const groupKeys = (keys: NonNullable<typeof data>['configuration']) => {
    const groups: Record<string, typeof keys> = {
      'Core': [],
      'LocalAuthList': [],
      'Metering': [],
      'Charging': [],
      'Connectivity': [],
      'Other': [],
    };

    keys.forEach(item => {
      if (item.key.includes('Heartbeat') || item.key.includes('Connection') || item.key.includes('WebSocket')) {
        groups['Connectivity'].push(item);
      } else if (item.key.includes('LocalAuth') || item.key.includes('Authorization')) {
        groups['LocalAuthList'].push(item);
      } else if (item.key.includes('Meter') || item.key.includes('Clock') || item.key.includes('Sample')) {
        groups['Metering'].push(item);
      } else if (item.key.includes('Charge') || item.key.includes('Transaction') || item.key.includes('Connector')) {
        groups['Charging'].push(item);
      } else if (item.key.includes('ChargePoint') || item.key.includes('Number') || item.key.includes('Supported')) {
        groups['Core'].push(item);
      } else {
        groups['Other'].push(item);
      }
    });

    return groups;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
          <p className="text-lg font-medium mb-2">Станция не поддерживает чтение конфигурации</p>
          <p className="text-sm mb-4">{(error as Error)?.message || 'GetConfiguration не поддерживается'}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.configuration) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Нет данных конфигурации</p>
        </CardContent>
      </Card>
    );
  }

  const groups = groupKeys(data.configuration);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          🔧 Конфигурация OCPP
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groups).map(([groupName, items]) => {
          if (items.length === 0) return null;
          
          return (
            <div key={groupName}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{groupName}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Ключ</TableHead>
                    <TableHead>Значение</TableHead>
                    <TableHead className="w-[120px]">Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell className="font-mono text-sm">
                        {item.key}
                      </TableCell>
                      <TableCell>
                        {editingKey === item.key ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="max-w-[300px]"
                            autoFocus
                          />
                        ) : (
                          <span className="font-mono text-sm">
                            {item.value ?? <span className="text-muted-foreground">—</span>}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.readonly ? (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Только чтение
                          </Badge>
                        ) : editingKey === item.key ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-500"
                              onClick={() => saveEdit(item.key)}
                              disabled={changeConfig.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(item.key, item.value)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Изменить
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        })}

        {data.unknown_keys && data.unknown_keys.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Неизвестные ключи</h3>
            <p className="text-sm text-muted-foreground">
              {data.unknown_keys.join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
