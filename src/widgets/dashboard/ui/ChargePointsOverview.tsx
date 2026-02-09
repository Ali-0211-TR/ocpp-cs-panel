import { useChargePoints } from '@entities/charge-point';
import { ChargePointCard } from '@entities/charge-point';
import { Card, CardContent, CardHeader, CardTitle, Spinner, ScrollArea, Button } from '@shared/ui';
import type { ChargePointDto } from '@shared/api';
import { Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ChargePointsOverview() {
  const { data: chargePointsData, isLoading } = useChargePoints({ 
    page: 1, 
    limit: 6,
    status: 'ONLINE' 
  });

  const chargePoints: ChargePointDto[] = chargePointsData?.items || [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Зарядные станции
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/charge-points" className="flex items-center gap-1">
            Все станции
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Spinner />
          </div>
        ) : chargePoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <Zap className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Нет станций онлайн</p>
            <p className="text-sm">Все станции отключены</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {chargePoints.map((cp) => (
                <ChargePointCard key={cp.id} chargePoint={cp} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
