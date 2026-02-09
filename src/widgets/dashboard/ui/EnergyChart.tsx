import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui';
import { formatEnergy } from '@shared/lib';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface EnergyChartProps {
  data?: {
    date: string;
    energy: number;
  }[];
  isLoading?: boolean;
}

// Демо данные если нет реальных
const generateDemoData = () => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      energy: Math.floor(Math.random() * 500) + 100,
    });
  }
  return data;
};

export function EnergyChart({ data, isLoading }: EnergyChartProps) {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    return generateDemoData();
  }, [data]);

  const totalEnergy = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.energy, 0);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Энергопотребление за неделю</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Загрузка...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Энергопотребление за неделю</CardTitle>
          <p className="text-2xl font-bold text-emerald-500 mt-2">
            {formatEnergy(totalEnergy)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} кВт·ч`}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value) => [formatEnergy(Number(value)), 'Энергия']}
              />
              <Bar
                dataKey="energy"
                fill="url(#energyGradient)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
