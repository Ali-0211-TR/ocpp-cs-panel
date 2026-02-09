import { Card, CardContent } from '@shared/ui';
import { cn } from '@shared/lib';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  iconColor = 'text-primary',
  className 
}: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <span className={cn(
                  'flex items-center text-xs font-medium',
                  trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                )}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10',
            iconColor.includes('emerald') && 'bg-emerald-500/10',
            iconColor.includes('blue') && 'bg-blue-500/10',
            iconColor.includes('amber') && 'bg-amber-500/10',
            iconColor.includes('violet') && 'bg-violet-500/10'
          )}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
