
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';
import { formatDateBR } from '@/utils/dateUtils';
import type { Event } from '@/contexts/DataContext';

interface EventSelectorProps {
  events: Event[];
  selectedEventId: string;
  onEventChange: (eventId: string) => void;
}

export const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  selectedEventId,
  onEventChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Seleção de Evento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedEventId} onValueChange={onEventChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um evento para calcular a folha" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name} - {formatDateBR(event.start_date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
