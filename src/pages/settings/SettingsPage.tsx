import { useState } from 'react';
import { PageHeader } from '@widgets/layout';
import { useAuthStore } from '@entities/auth';
import { useCurrentUser, useChangePassword } from '@features/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Button,
  Label,
  Switch,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui';
import { User, Lock, Bell, Monitor, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string().min(6, 'Минимум 6 символов'),
  confirmPassword: z.string().min(1, 'Подтвердите пароль'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function SettingsPage() {
  const { user } = useAuthStore();
  const { user: currentUser } = useCurrentUser();
  const changePassword = useChangePassword();

  // Notification settings (local state for demo)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    chargePointOffline: true,
    transactionComplete: false,
    lowBalance: true,
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onChangePassword = async (data: ChangePasswordForm) => {
    try {
      await changePassword.mutateAsync({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      toast.success('Пароль успешно изменён');
      passwordForm.reset();
    } catch (error) {
      toast.error('Ошибка при изменении пароля');
    }
  };

  const displayUser = currentUser || user;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Настройки"
        description="Управление профилем и настройками системы"
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Система
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Профиль пользователя</CardTitle>
              <CardDescription>
                Информация о вашем аккаунте
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{displayUser?.username || 'Пользователь'}</h3>
                  <p className="text-muted-foreground">{displayUser?.role || 'Администратор'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input
                    id="username"
                    value={displayUser?.username || ''}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Изменить пароль</CardTitle>
              <CardDescription>
                Обновите пароль для безопасности аккаунта
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending ? 'Сохранение...' : 'Изменить пароль'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>
                Настройте, какие уведомления вы хотите получать
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать уведомления на почту
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => 
                    setNotifications((prev) => ({ ...prev, email: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push-уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать push-уведомления в браузере
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => 
                    setNotifications((prev) => ({ ...prev, push: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Станция офлайн</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомлять когда станция переходит в офлайн
                  </p>
                </div>
                <Switch
                  checked={notifications.chargePointOffline}
                  onCheckedChange={(checked) => 
                    setNotifications((prev) => ({ ...prev, chargePointOffline: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Завершение транзакции</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомлять о завершении каждой транзакции
                  </p>
                </div>
                <Switch
                  checked={notifications.transactionComplete}
                  onCheckedChange={(checked) => 
                    setNotifications((prev) => ({ ...prev, transactionComplete: checked }))
                  }
                />
              </div>

              <div className="pt-4">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Системные настройки</CardTitle>
              <CardDescription>
                Настройки системы и подключения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 max-w-md">
                <div className="grid gap-2">
                  <Label>API URL</Label>
                  <Input
                    value="http://localhost:8080/api/v1"
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label>WebSocket URL</Label>
                  <Input
                    value="ws://localhost:8080/api/v1/notifications/ws"
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Версия системы</Label>
                  <Input
                    value="1.0.0"
                    disabled
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Информация о системе</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>OCPP версия: 1.6</p>
                  <p>База данных: PostgreSQL</p>
                  <p>Кэш: Redis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
