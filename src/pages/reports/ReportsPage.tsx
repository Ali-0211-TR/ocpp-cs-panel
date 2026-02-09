import { PageHeader } from '@widgets/layout';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@shared/ui';
import { FileText, Download, Calendar } from 'lucide-react';

export function ReportsPage() {
  const reports = [
    {
      id: 'transactions',
      title: 'Отчёт по транзакциям',
      description: 'Детальный отчёт по всем зарядным сессиям',
      icon: FileText,
    },
    {
      id: 'revenue',
      title: 'Финансовый отчёт',
      description: 'Выручка по периодам и станциям',
      icon: FileText,
    },
    {
      id: 'energy',
      title: 'Отчёт по энергопотреблению',
      description: 'Статистика потребления энергии',
      icon: FileText,
    },
    {
      id: 'chargepoints',
      title: 'Отчёт по станциям',
      description: 'Статистика работы зарядных станций',
      icon: FileText,
    },
    {
      id: 'idtags',
      title: 'Отчёт по RFID картам',
      description: 'Активность использования карт',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Отчёты"
        description="Генерация и скачивание отчётов"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <report.icon className="h-5 w-5 text-primary" />
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {report.description}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Выбрать период
                </Button>
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Скачать
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Запланированные отчёты</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Автоматическая генерация отчётов будет доступна в следующей версии
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
