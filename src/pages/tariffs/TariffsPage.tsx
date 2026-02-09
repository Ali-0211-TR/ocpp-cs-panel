import { useState } from 'react';
import { useTariffs, useCreateTariff, useDeleteTariff } from '@entities/tariff';
import { PageHeader } from '@widgets/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Label,
  Textarea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui';
import { TARIFF_TYPES } from '@shared/config';
import { formatCurrency, formatDate } from '@shared/lib';
import { Plus, RefreshCw, MoreVertical, Pencil, Trash2, Coins, Clock, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const createTariffSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  tariff_type: z.enum(['PerKwh', 'PerMinute', 'PerSession', 'Combined']),
  price_per_kwh: z.string().optional(),
  price_per_minute: z.string().optional(),
  session_fee: z.string().optional(),
  currency: z.string(),
  description: z.string().optional(),
});

type CreateTariffForm = z.infer<typeof createTariffSchema>;

export function TariffsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: tariffs = [], isLoading, refetch, isFetching } = useTariffs();
  const createMutation = useCreateTariff();
  const deleteMutation = useDeleteTariff();

  const form = useForm<CreateTariffForm>({
    resolver: zodResolver(createTariffSchema),
    defaultValues: {
      name: '',
      tariff_type: 'PerKwh',
      price_per_kwh: '',
      price_per_minute: '',
      session_fee: '',
      currency: 'UZS',
      description: '',
    },
  });

  const tariffType = form.watch('tariff_type');

  const onSubmit = async (data: CreateTariffForm) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        tariff_type: data.tariff_type,
        price_per_kwh: data.price_per_kwh ? parseFloat(data.price_per_kwh) : 0,
        price_per_minute: data.price_per_minute ? parseFloat(data.price_per_minute) : 0,
        session_fee: data.session_fee ? parseFloat(data.session_fee) : 0,
        currency: data.currency,
        description: data.description || undefined,
      });
      toast.success('Тариф создан');
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error('Ошибка при создании тарифа');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить тариф?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Тариф удалён');
    } catch (error) {
      toast.error('Ошибка при удалении тарифа');
    }
  };

  const getTariffIcon = (type: string) => {
    switch (type) {
      case 'PerKwh':
        return <Zap className="h-5 w-5 text-amber-500" />;
      case 'PerMinute':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Coins className="h-5 w-5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Тарифы"
        description="Управление тарифами на зарядку"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать тариф
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Создать тариф</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название *</Label>
                    <Input
                      id="name"
                      placeholder="Например: Стандартный"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tariff_type">Тип тарифа *</Label>
                    <Select
                      value={tariffType}
                      onValueChange={(v) => form.setValue('tariff_type', v as 'PerKwh' | 'PerMinute' | 'PerSession' | 'Combined')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PerKwh">За кВт·ч</SelectItem>
                        <SelectItem value="PerMinute">За минуту</SelectItem>
                        <SelectItem value="PerSession">За сессию</SelectItem>
                        <SelectItem value="Combined">Комбинированный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(tariffType === 'PerKwh' || tariffType === 'Combined') && (
                    <div className="space-y-2">
                      <Label htmlFor="price_per_kwh">Цена за кВт·ч (UZS)</Label>
                      <Input
                        id="price_per_kwh"
                        type="number"
                        step="0.01"
                        placeholder="1500"
                        {...form.register('price_per_kwh')}
                      />
                    </div>
                  )}

                  {(tariffType === 'PerMinute' || tariffType === 'Combined') && (
                    <div className="space-y-2">
                      <Label htmlFor="price_per_minute">Цена за минуту (UZS)</Label>
                      <Input
                        id="price_per_minute"
                        type="number"
                        step="0.01"
                        placeholder="100"
                        {...form.register('price_per_minute')}
                      />
                    </div>
                  )}

                  {(tariffType === 'PerSession' || tariffType === 'Combined') && (
                    <div className="space-y-2">
                      <Label htmlFor="session_fee">Плата за сессию (UZS)</Label>
                      <Input
                        id="session_fee"
                        type="number"
                        step="0.01"
                        placeholder="50000"
                        {...form.register('session_fee')}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      placeholder="Описание тарифа..."
                      {...form.register('description')}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Создание...' : 'Создать'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Tariffs Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : tariffs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Coins className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Тарифы не найдены</p>
            <p className="text-sm">Создайте первый тариф</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tariffs.map((tariff) => {
            const typeConfig = TARIFF_TYPES[tariff.tariff_type as keyof typeof TARIFF_TYPES] || TARIFF_TYPES.PerKwh;
            return (
              <Card key={tariff.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {getTariffIcon(tariff.tariff_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tariff.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {typeConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(tariff.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tariff.price_per_kwh > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Цена за кВт·ч</span>
                      <span className="font-medium">
                        {formatCurrency(tariff.price_per_kwh, tariff.currency)}
                      </span>
                    </div>
                  )}
                  {tariff.price_per_minute > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Цена за минуту</span>
                      <span className="font-medium">
                        {formatCurrency(tariff.price_per_minute, tariff.currency)}
                      </span>
                    </div>
                  )}
                  {tariff.session_fee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Плата за сессию</span>
                      <span className="font-medium">
                        {formatCurrency(tariff.session_fee, tariff.currency)}
                      </span>
                    </div>
                  )}
                  {tariff.description && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                      {tariff.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Создан: {formatDate(tariff.created_at, 'short')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
