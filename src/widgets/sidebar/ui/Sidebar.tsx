import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  ArrowRightLeft,
  Tags,
  DollarSign,
  Activity,
  Settings,
  Key,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@features/auth';
import { cn } from '@shared/lib';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/charge-points', label: 'Charge Points', icon: Zap },
  { to: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { to: '/id-tags', label: 'ID Tags', icon: Tags },
  { to: '/tariffs', label: 'Tariffs', icon: DollarSign },
  { to: '/monitoring', label: 'Monitoring', icon: Activity },
  { to: '/api-keys', label: 'API Keys', icon: Key },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-800">
        <Zap className="h-6 w-6 text-green-400" />
        <span className="text-lg font-bold">OCPP Central</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-800 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
