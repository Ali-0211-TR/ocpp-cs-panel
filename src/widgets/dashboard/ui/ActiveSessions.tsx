import { useActiveTransactions } from '@entities/transaction';
import { ActiveSessionCard } from '@entities/transaction';
import { Card, CardContent, CardHeader, CardTitle, Spinner, ScrollArea } from '@shared/ui';
import { Activity } from 'lucide-react';
import type { TransactionDto } from '@shared/api';

export function ActiveSessions() {
  const { data: transactions, isLoading } = useActiveTransactions();

  const activeSessions = (transactions as TransactionDto[] | undefined)?.filter((t) => t.status === 'IN_PROGRESS') || [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Активные сессии
        </CardTitle>
        {activeSessions.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {activeSessions.length} сессий
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Spinner />
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Нет активных сессий</p>
            <p className="text-sm">Все станции свободны</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <ActiveSessionCard key={session.id} transaction={session} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
