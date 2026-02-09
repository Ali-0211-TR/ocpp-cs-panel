import { NavLink } from 'react-router-dom';
import { cn } from '@shared/lib';
import { Button, ScrollArea, Separator, Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@shared/ui';
import { WsStatusIndicator } from '@features/websocket';
import { useUser, useLogout } from '@features/auth';
import { 
  LayoutDashboard, 
  Zap, 
  Activity, 
  CreditCard, 
  Tag, 
  Users, 
  Key,
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

const mainNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/charge-points', icon: Zap, label: 'Станции' },
  { to: '/transactions', icon: Activity, label: 'Сессии' },
  { to: '/id-tags', icon: Tag, label: 'RFID Карты' },
  { to: '/tariffs', icon: CreditCard, label: 'Тарифы' },
  { to: '/reports', icon: FileText, label: 'Отчёты' },
];

const settingsNavItems = [
  { to: '/users', icon: Users, label: 'Пользователи' },
  { to: '/api-keys', icon: Key, label: 'API Ключи' },
  { to: '/settings', icon: Settings, label: 'Настройки' },
];

export function Sidebar({ collapsed = false, onCollapsedChange, className }: SidebarProps) {
  const user = useUser();
  const logout = useLogout();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        'flex flex-col h-screen border-r bg-card transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[240px]',
        className
      )}>
        {/* Header */}
        <div className={cn(
          'flex items-center h-14 border-b px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-semibold text-lg">OCPP</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapsedChange?.(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {mainNavItems.map((item) => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
          </nav>

          <Separator className="my-4 mx-2" />

          <nav className="space-y-1 px-2">
            {settingsNavItems.map((item) => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          {/* WebSocket Status */}
          <div className={cn('mb-3', collapsed && 'flex justify-center')}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <WsStatusIndicator showLabel={false} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <WsStatusIndicator />
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">WS:</span>
                <WsStatusIndicator />
              </div>
            )}
          </div>

          {/* User */}
          <div className={cn(
            'flex items-center',
            collapsed ? 'justify-center' : 'justify-between'
          )}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Выйти ({user?.username})</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="shrink-0">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed?: boolean;
}

function NavItem({ to, icon: Icon, label, collapsed }: NavItemProps) {
  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          className={({ isActive }) => cn(
            'flex items-center justify-center h-10 rounded-lg transition-colors',
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  ) : (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 h-10 rounded-lg transition-colors',
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
