import { useMonitoringStats } from '@entities/monitoring';
import { useChargePointStats } from '@entities/charge-point';
import { useIdTags } from '@entities/id-tag';
import { formatCurrency } from '@shared/lib';
import { Spinner } from '@shared/ui';
import { StatCard } from './StatCard';
import { 
  Zap, 
  Wifi, 
  Activity, 
  Fuel, 
  CreditCard, 
  Tag 
} from 'lucide-react';

export function StatsOverview() {
  const { data: monitoringStats, isLoading: monitoringLoading } = useMonitoringStats();
  const { data: cpStats, isLoading: cpLoading } = useChargePointStats();
  const { data: idTagsData, isLoading: idTagsLoading } = useIdTags({ limit: 1 });

  const isLoading = monitoringLoading || cpLoading || idTagsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl border bg-card flex items-center justify-center">
            <Spinner />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Всего станций',
      value: monitoringStats?.total || cpStats?.total || 0,
      icon: Zap,
      iconColor: 'text-primary',
      description: 'Зарегистрировано в системе',
    },
    {
      title: 'Онлайн',
      value: monitoringStats?.online || cpStats?.online || 0,
      icon: Wifi,
      iconColor: 'text-emerald-500',
      description: `${monitoringStats?.offline || cpStats?.offline || 0} офлайн`,
    },
    {
      title: 'Активных сессий',
      value: cpStats?.charging || 0,
      icon: Activity,
      iconColor: 'text-blue-500',
      description: 'Идёт зарядка',
    },
    {
      title: 'Энергия сегодня',
      value: '0.00 кВт·ч',
      icon: Fuel,
      iconColor: 'text-amber-500',
      description: 'Потреблено за день',
    },
    {
      title: 'Выручка сегодня',
      value: formatCurrency(0, 'UZS'),
      icon: CreditCard,
      iconColor: 'text-violet-500',
      description: 'Заработано за день',
    },
    {
      title: 'RFID карт',
      value: idTagsData?.total || 0,
      icon: Tag,
      iconColor: 'text-slate-400',
      description: 'Активных карт',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
