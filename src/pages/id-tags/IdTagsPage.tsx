import { useState } from 'react';
import { useIdTags, useCreateIdTag, useDeleteIdTag } from '@entities/id-tag';
import { PageHeader } from '@widgets/layout';
import {
  Card,
  CardContent,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { ID_TAG_STATUSES } from '@shared/config';
import { formatDate } from '@shared/lib';
import { Search, Plus, RefreshCw, MoreVertical, Pencil, Trash2, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const createIdTagSchema = z.object({
  idTag: z.string().min(1, 'ID тега обязателен').max(20, 'Максимум 20 символов'),
  parentIdTag: z.string().optional(),
  expiryDate: z.string().optional(),
});

type CreateIdTagForm = z.infer<typeof createIdTagSchema>;

export function IdTagsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: idTagsData, isLoading, refetch, isFetching } = useIdTags({
    page,
    limit: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const createMutation = useCreateIdTag();
  const deleteMutation = useDeleteIdTag();

  const idTags = idTagsData?.items || [];
  const totalPages = idTagsData?.total_pages || 1;

  const form = useForm<CreateIdTagForm>({
    resolver: zodResolver(createIdTagSchema),
    defaultValues: {
      idTag: '',
      parentIdTag: '',
      expiryDate: '',
    },
  });

  const onSubmit = async (data: CreateIdTagForm) => {
    try {
      await createMutation.mutateAsync({
        id_tag: data.idTag,
        parent_id_tag: data.parentIdTag || undefined,
        expiry_date: data.expiryDate || undefined,
      });
      toast.success('RFID карта добавлена');
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error('Ошибка при добавлении карты');
    }
  };

  const handleDelete = async (idTag: string) => {
    if (!confirm(`Удалить карту ${idTag}?`)) return;
    try {
      await deleteMutation.mutateAsync(idTag);
      toast.success('Карта удалена');
    } catch (error) {
      toast.error('Ошибка при удалении карты');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="RFID карты"
        description="Управление картами доступа"
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
                  Добавить карту
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить RFID карту</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idTag">ID карты *</Label>
                    <Input
                      id="idTag"
                      placeholder="Введите ID карты"
                      {...form.register('idTag')}
                    />
                    {form.formState.errors.idTag && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.idTag.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentIdTag">Родительская карта</Label>
                    <Input
                      id="parentIdTag"
                      placeholder="ID родительской карты (опционально)"
                      {...form.register('parentIdTag')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Срок действия</Label>
                    <Input
                      id="expiryDate"
                      type="datetime-local"
                      {...form.register('expiryDate')}
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
                      {createMutation.isPending ? 'Добавление...' : 'Добавить'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ID карты..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.entries(ID_TAG_STATUSES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ID Tags Table */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : idTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Tag className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Карты не найдены</p>
              <p className="text-sm">Добавьте первую RFID карту</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID карты</TableHead>
                    <TableHead>Родительская карта</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Срок действия</TableHead>
                    <TableHead>Создана</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {idTags.map((tag) => {
                    const statusConfig = ID_TAG_STATUSES[tag.status as keyof typeof ID_TAG_STATUSES] || ID_TAG_STATUSES.BLOCKED;
                    return (
                      <TableRow key={tag.id_tag}>
                        <TableCell className="font-mono font-medium">
                          {tag.id_tag}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tag.parent_id_tag || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tag.expiry_date 
                            ? formatDate(tag.expiry_date, 'short')
                            : 'Бессрочно'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tag.created_at ? formatDate(tag.created_at, 'short') : '—'}
                        </TableCell>
                        <TableCell>
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
                                onClick={() => handleDelete(tag.id_tag)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Страница {page} из {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Назад
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Вперёд
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
