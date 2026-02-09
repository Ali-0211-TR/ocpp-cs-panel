import { useState } from 'react';
import { 
  useResetChargePoint,
  useRemoteStartTransaction,
  useRemoteStopTransaction,
  useUnlockConnector,
  useChangeAvailability,
  useTriggerMessage,
  useClearCache,
  useDataTransfer,
  chargePointsApi
} from '@entities/charge-point';
import { useIdTags } from '@entities/id-tag';
import { useActiveTransactions } from '@entities/transaction';
import type { ConnectorDto } from '@shared/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Label,
  Textarea,
} from '@shared/ui';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Unlock, 
  Settings, 
  MessageSquare, 
  Trash2, 
  List,
  Send,
  PowerOff
} from 'lucide-react';
import { toast } from 'sonner';

interface CommandsTabProps {
  chargePointId: string;
  connectors: ConnectorDto[];
  isOnline: boolean;
}

export function CommandsTab({ chargePointId, connectors, isOnline }: CommandsTabProps) {
  const [remoteStartOpen, setRemoteStartOpen] = useState(false);
  const [remoteStopOpen, setRemoteStopOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [dataTransferOpen, setDataTransferOpen] = useState(false);

  // Form state
  const [selectedIdTag, setSelectedIdTag] = useState('');
  const [selectedConnector, setSelectedConnector] = useState<number | undefined>();
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | undefined>();
  const [resetType, setResetType] = useState<'Soft' | 'Hard'>('Soft');
  const [availabilityType, setAvailabilityType] = useState<'Operative' | 'Inoperative'>('Operative');
  const [triggerMessageType, setTriggerMessageType] = useState('StatusNotification');
  const [vendorId, setVendorId] = useState('');
  const [messageId, setMessageId] = useState('');
  const [dataTransferData, setDataTransferData] = useState('');

  // Queries
  const { data: idTagsData } = useIdTags({ page: 1, limit: 100 });
  const { data: activeTransactions } = useActiveTransactions(chargePointId);

  // Mutations
  const resetMutation = useResetChargePoint();
  const remoteStartMutation = useRemoteStartTransaction();
  const remoteStopMutation = useRemoteStopTransaction();
  const unlockMutation = useUnlockConnector();
  const availabilityMutation = useChangeAvailability();
  const triggerMutation = useTriggerMessage();
  const clearCacheMutation = useClearCache();
  const dataTransferMutation = useDataTransfer();

  const idTags = idTagsData?.items || [];
  const transactions = Array.isArray(activeTransactions) ? activeTransactions : [];

  const handleRemoteStart = async () => {
    if (!selectedIdTag) {
      toast.error('Выберите ID карты');
      return;
    }
    await remoteStartMutation.mutateAsync({
      chargePointId,
      data: { 
        id_tag: selectedIdTag, 
        connector_id: selectedConnector 
      },
    });
    setRemoteStartOpen(false);
    setSelectedIdTag('');
    setSelectedConnector(undefined);
  };

  const handleRemoteStop = async () => {
    if (!selectedTransactionId) {
      toast.error('Выберите транзакцию');
      return;
    }
    await remoteStopMutation.mutateAsync({
      chargePointId,
      data: { transaction_id: selectedTransactionId },
    });
    setRemoteStopOpen(false);
    setSelectedTransactionId(undefined);
  };

  const handleReset = async () => {
    await resetMutation.mutateAsync({
      chargePointId,
      data: { type: resetType },
    });
    setResetOpen(false);
  };

  const handleUnlock = async () => {
    if (!selectedConnector) {
      toast.error('Выберите коннектор');
      return;
    }
    await unlockMutation.mutateAsync({
      chargePointId,
      data: { connector_id: selectedConnector },
    });
    setUnlockOpen(false);
    setSelectedConnector(undefined);
  };

  const handleAvailability = async () => {
    await availabilityMutation.mutateAsync({
      chargePointId,
      data: { 
        connector_id: selectedConnector || 0, 
        type: availabilityType 
      },
    });
    setAvailabilityOpen(false);
    setSelectedConnector(undefined);
  };

  const handleTrigger = async () => {
    await triggerMutation.mutateAsync({
      chargePointId,
      data: { 
        message: triggerMessageType, 
        connector_id: selectedConnector 
      },
    });
    setTriggerOpen(false);
  };

  const handleClearCache = async () => {
    if (!confirm('Очистить кэш авторизации станции?')) return;
    await clearCacheMutation.mutateAsync(chargePointId);
  };

  const handleLocalListVersion = async () => {
    try {
      const response = await chargePointsApi.getLocalListVersion(chargePointId);
      if (response.list_version === -1) {
        toast.info('Станция не поддерживает локальный список авторизации');
      } else if (response.list_version === 0) {
        toast.info('Локальный список авторизации пуст');
      } else {
        toast.info(`Версия списка авторизации: ${response.list_version}`);
      }
    } catch (error) {
      toast.error('Станция не поддерживает эту команду');
    }
  };

  const handleDataTransfer = async () => {
    if (!vendorId) {
      toast.error('Укажите Vendor ID');
      return;
    }
    await dataTransferMutation.mutateAsync({
      chargePointId,
      data: {
        vendor_id: vendorId,
        message_id: messageId || undefined,
        data: dataTransferData || undefined,
      },
    });
    setDataTransferOpen(false);
    setVendorId('');
    setMessageId('');
    setDataTransferData('');
  };

  if (!isOnline) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <PowerOff className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Станция офлайн</p>
          <p className="text-sm">Команды доступны только для онлайн-станций</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Команды OCPP</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Remote Start */}
          <Dialog open={remoteStartOpen} onOpenChange={setRemoteStartOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Play className="h-6 w-6 text-green-500" />
                <span>Запустить зарядку</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Запустить зарядку</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ID карты *</Label>
                  <Select value={selectedIdTag} onValueChange={setSelectedIdTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите карту" />
                    </SelectTrigger>
                    <SelectContent>
                      {idTags.map((tag) => (
                        <SelectItem key={tag.id_tag} value={tag.id_tag}>
                          {tag.name || tag.id_tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Коннектор (опционально)</Label>
                  <Select 
                    value={selectedConnector?.toString() || '__any__'} 
                    onValueChange={(v) => setSelectedConnector(v === '__any__' ? undefined : parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Любой свободный" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__any__">Любой свободный</SelectItem>
                      {connectors.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          Коннектор #{c.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRemoteStartOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleRemoteStart} 
                  disabled={remoteStartMutation.isPending}
                >
                  {remoteStartMutation.isPending ? 'Отправка...' : 'Запустить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Remote Stop */}
          <Dialog open={remoteStopOpen} onOpenChange={setRemoteStopOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Square className="h-6 w-6 text-red-500" />
                <span>Остановить зарядку</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Остановить зарядку</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Активная транзакция *</Label>
                  <Select 
                    value={selectedTransactionId?.toString() || ''} 
                    onValueChange={(v) => setSelectedTransactionId(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите транзакцию" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactions.length === 0 ? (
                        <SelectItem value="__empty__" disabled>Нет активных транзакций</SelectItem>
                      ) : (
                        transactions.map((tx) => (
                          <SelectItem key={tx.id} value={tx.id.toString()}>
                            #{tx.id} - Коннектор {tx.connector_id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRemoteStopOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleRemoteStop} 
                  disabled={remoteStopMutation.isPending || !selectedTransactionId}
                >
                  {remoteStopMutation.isPending ? 'Отправка...' : 'Остановить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reset */}
          <Dialog open={resetOpen} onOpenChange={setResetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <RefreshCw className="h-6 w-6 text-blue-500" />
                <span>Перезагрузить</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Перезагрузить станцию</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Тип перезагрузки</Label>
                  <Select value={resetType} onValueChange={(v: 'Soft' | 'Hard') => setResetType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soft">Soft (мягкая)</SelectItem>
                      <SelectItem value="Hard">Hard (жёсткая)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleReset} 
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? 'Отправка...' : 'Перезагрузить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Unlock Connector */}
          <Dialog open={unlockOpen} onOpenChange={setUnlockOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Unlock className="h-6 w-6 text-amber-500" />
                <span>Разблокировать</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Разблокировать коннектор</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Коннектор *</Label>
                  <Select 
                    value={selectedConnector?.toString() || ''} 
                    onValueChange={(v) => setSelectedConnector(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите коннектор" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectors.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          Коннектор #{c.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUnlockOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleUnlock} 
                  disabled={unlockMutation.isPending || !selectedConnector}
                >
                  {unlockMutation.isPending ? 'Отправка...' : 'Разблокировать'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Change Availability */}
          <Dialog open={availabilityOpen} onOpenChange={setAvailabilityOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Settings className="h-6 w-6 text-purple-500" />
                <span>Доступность</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Изменить доступность</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Коннектор</Label>
                  <Select 
                    value={selectedConnector?.toString() || '0'} 
                    onValueChange={(v) => setSelectedConnector(parseInt(v) || 0)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Вся станция</SelectItem>
                      {connectors.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          Коннектор #{c.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select 
                    value={availabilityType} 
                    onValueChange={(v: 'Operative' | 'Inoperative') => setAvailabilityType(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operative">Operative (доступна)</SelectItem>
                      <SelectItem value="Inoperative">Inoperative (недоступна)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAvailabilityOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleAvailability} 
                  disabled={availabilityMutation.isPending}
                >
                  {availabilityMutation.isPending ? 'Отправка...' : 'Применить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Trigger Message */}
          <Dialog open={triggerOpen} onOpenChange={setTriggerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <MessageSquare className="h-6 w-6 text-cyan-500" />
                <span>Запросить сообщение</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Запросить сообщение</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Тип сообщения</Label>
                  <Select value={triggerMessageType} onValueChange={setTriggerMessageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BootNotification">BootNotification</SelectItem>
                      <SelectItem value="DiagnosticsStatusNotification">DiagnosticsStatusNotification</SelectItem>
                      <SelectItem value="FirmwareStatusNotification">FirmwareStatusNotification</SelectItem>
                      <SelectItem value="Heartbeat">Heartbeat</SelectItem>
                      <SelectItem value="MeterValues">MeterValues</SelectItem>
                      <SelectItem value="StatusNotification">StatusNotification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Коннектор (опционально)</Label>
                  <Select 
                    value={selectedConnector?.toString() || '__none__'} 
                    onValueChange={(v) => setSelectedConnector(v === '__none__' ? undefined : parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Не указан" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Не указан</SelectItem>
                      {connectors.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          Коннектор #{c.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTriggerOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleTrigger} 
                  disabled={triggerMutation.isPending}
                >
                  {triggerMutation.isPending ? 'Отправка...' : 'Запросить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Clear Cache */}
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={handleClearCache}
            disabled={clearCacheMutation.isPending}
          >
            <Trash2 className="h-6 w-6 text-orange-500" />
            <span>Очистить кэш</span>
          </Button>

          {/* Local List Version */}
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={handleLocalListVersion}
          >
            <List className="h-6 w-6 text-teal-500" />
            <span>Версия авт. списка</span>
          </Button>

          {/* Data Transfer */}
          <Dialog open={dataTransferOpen} onOpenChange={setDataTransferOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Send className="h-6 w-6 text-indigo-500" />
                <span>Data Transfer</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Data Transfer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Vendor ID *</Label>
                  <Input 
                    value={vendorId} 
                    onChange={(e) => setVendorId(e.target.value)}
                    placeholder="Например: VendorX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message ID (опционально)</Label>
                  <Input 
                    value={messageId} 
                    onChange={(e) => setMessageId(e.target.value)}
                    placeholder="Идентификатор сообщения"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data (опционально)</Label>
                  <Textarea 
                    value={dataTransferData} 
                    onChange={(e) => setDataTransferData(e.target.value)}
                    placeholder="Данные для отправки"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDataTransferOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleDataTransfer} 
                  disabled={dataTransferMutation.isPending || !vendorId}
                >
                  {dataTransferMutation.isPending ? 'Отправка...' : 'Отправить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
