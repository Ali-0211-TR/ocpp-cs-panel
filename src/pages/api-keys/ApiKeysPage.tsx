import { useState } from 'react';
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '@entities/api-key';
import { PageHeader } from '@widgets/layout';
import {
  Card,
  CardContent,
  Input,
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Label,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui';
import { formatDate } from '@shared/lib';
import { Plus, RefreshCw, MoreVertical, Trash2, Key, Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  scopes: z.array(z.string()),
  expires_in_days: z.string().optional(),
});

type CreateApiKeyForm = z.infer<typeof createApiKeySchema>;

export function ApiKeysPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const { data: apiKeys = [], isLoading, refetch, isFetching } = useApiKeys();
  const createMutation = useCreateApiKey();
  const deleteMutation = useDeleteApiKey();

  const form = useForm<CreateApiKeyForm>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
      scopes: ['read', 'write'],
      expires_in_days: '',
    },
  });

  const onSubmit = async (data: CreateApiKeyForm) => {
    try {
      const result = await createMutation.mutateAsync({
        name: data.name,
        scopes: data.scopes,
        expires_in_days: data.expires_in_days ? parseInt(data.expires_in_days) : undefined,
      });
      setNewApiKey(result.key);
      toast.success('API ключ создан');
      form.reset();
    } catch (error) {
      toast.error('Ошибка при создании ключа');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить API ключ? Это действие нельзя отменить.')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Ключ удалён');
    } catch (error) {
      toast.error('Ошибка при удалении ключа');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано в буфер обмена');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="API ключи"
        description="Управление ключами доступа к API"
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
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) setNewApiKey(null);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать ключ
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {newApiKey ? 'Ключ создан' : 'Создать API ключ'}
                  </DialogTitle>
                </DialogHeader>
                {newApiKey ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm text-amber-500 mb-2">
                        ⚠️ Сохраните этот ключ! Он больше не будет показан.
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 rounded bg-muted text-sm font-mono break-all">
                          {newApiKey}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(newApiKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        setIsCreateDialogOpen(false);
                        setNewApiKey(null);
                      }}>
                        Готово
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Название *</Label>
                      <Input
                        id="name"
                        placeholder="Например: Мобильное приложение"
                        {...form.register('name')}
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expires_in_days">Срок действия (дней)</Label>
                      <Input
                        id="expires_in_days"
                        type="number"
                        placeholder="30 (пусто = бессрочно)"
                        {...form.register('expires_in_days')}
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
                )}
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* API Keys Table */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Key className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">API ключи не найдены</p>
              <p className="text-sm">Создайте первый API ключ</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Префикс</TableHead>
                  <TableHead>Области доступа</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Срок действия</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => {
                  const isExpired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date();
                  return (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                          {apiKey.prefix}***
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {apiKey.scopes.join(', ')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isExpired ? 'destructive' : apiKey.is_active ? 'default' : 'secondary'}>
                          {isExpired ? 'Истёк' : apiKey.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {apiKey.expires_at 
                          ? formatDate(apiKey.expires_at, 'short')
                          : 'Бессрочно'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(apiKey.created_at, 'short')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(apiKey.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
