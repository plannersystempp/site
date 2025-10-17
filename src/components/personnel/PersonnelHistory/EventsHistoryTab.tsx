import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventsHistory } from '@/hooks/queries/usePersonnelHistoryQuery';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { EmptyState } from '@/components/shared/EmptyState';

interface EventsHistoryTabProps {
  personnelId: string;
}

export const EventsHistoryTab: React.FC<EventsHistoryTabProps> = ({ personnelId }) => {
  const { data: events, isLoading } = useEventsHistory(personnelId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="w-12 h-12" />}
        title="Nenhum evento encontrado"
        description="Esta pessoa ainda não participou de nenhum evento"
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className={event.isPaid ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500'}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-base truncate">{event.name}</h3>
                  <Badge variant={event.isPaid ? 'default' : 'secondary'} className="flex-shrink-0">
                    {event.isPaid ? <Check className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                    {event.isPaid ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Período</p>
                    <p className="font-medium">
                      {format(new Date(event.startDate), 'dd/MM/yy')} - {format(new Date(event.endDate), 'dd/MM/yy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Dias Trabalhados</p>
                    <p className="font-medium">{event.workDays.length} dias</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Função</p>
                    <p className="font-medium truncate">{event.functionName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <Badge variant="outline" className="text-xs">
                      {event.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Total do Evento</p>
                    <p className="font-bold text-lg">{formatCurrency(event.totalAmount)}</p>
                  </div>
                  {event.totalPaid > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Valor Pago</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(event.totalPaid)}</p>
                    </div>
                  )}
                  {!event.isPaid && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Pendente</p>
                      <p className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(event.totalAmount - event.totalPaid)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
