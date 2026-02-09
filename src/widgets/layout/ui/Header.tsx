import { useState } from 'react';
import { 
  Button, 
  Input, 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
  ScrollArea
} from '@shared/ui';
import { cn, timeAgo } from '@shared/lib';
import { WS_EVENT_TYPES } from '@shared/config';
import { useLatestEvents } from '@features/websocket';
import { useUser, useLogout } from '@features/auth';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  User,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import type { WsEvent } from '@shared/api';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const user = useUser();
  const logout = useLogout();
  const events = useLatestEvents(10);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const unreadCount = events.filter((e) => 
    ['transaction_started', 'transaction_stopped', 'error', 'charge_point_disconnected'].includes(e.event_type)
  ).length;

  return (
    <header className={cn(
      'flex items-center justify-between h-14 px-4 border-b bg-card',
      className
    )}>
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск станций, транзакций..." 
            className="pl-9 h-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <NotificationBell events={events} unreadCount={unreadCount} />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Профиль
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Настройки
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface NotificationBellProps {
  events: WsEvent[];
  unreadCount: number;
}

function NotificationBell({ events, unreadCount }: NotificationBellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Уведомления</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} новых
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {events.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Activity className="h-4 w-4 mr-2" />
              <span className="text-sm">Нет уведомлений</span>
            </div>
          ) : (
            events.map((event) => (
              <NotificationItem key={event.id} event={event} />
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationItem({ event }: { event: WsEvent }) {
  const config = WS_EVENT_TYPES[event.event_type];
  
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer">
      <div className={cn(
        'w-2 h-2 rounded-full mt-2 shrink-0',
        config?.color === 'emerald' && 'bg-emerald-500',
        config?.color === 'red' && 'bg-red-500',
        config?.color === 'amber' && 'bg-amber-500',
        config?.color === 'blue' && 'bg-blue-500',
        config?.color === 'slate' && 'bg-slate-500'
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {config?.label || event.event_type}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {event.charge_point_id}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {timeAgo(event.timestamp)}
        </p>
      </div>
    </div>
  );
}
