
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, Search, Calendar, MapPin, User } from 'lucide-react';
import { formatDateBR } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import type { Event } from '@/contexts/DataContext';

interface EventSelectorProps {
  events: Event[];
  selectedEventId: string;
  onEventChange: (eventId: string) => void;
}

const statusConfig = {
  planejado: { label: 'Planejado', variant: 'secondary' as const },
  em_andamento: { label: 'Em Andamento', variant: 'default' as const },
  concluido: { label: 'Concluído', variant: 'outline' as const },
  concluido_pagamento_pendente: { label: 'Pagamento Pendente', variant: 'destructive' as const },
  cancelado: { label: 'Cancelado', variant: 'secondary' as const }
};

export const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  selectedEventId,
  onEventChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar eventos pela busca
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events;
    
    const term = searchTerm.toLowerCase();
    return events.filter(event => 
      event.name?.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term) ||
      event.location?.toLowerCase().includes(term)
    );
  }, [events, searchTerm]);

  // Ordenar eventos por data de início (mais recentes primeiro)
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const dateA = new Date(a.start_date || 0).getTime();
      const dateB = new Date(b.start_date || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredEvents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Seleção de Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar evento por nome, descrição ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Grid de Cards de Eventos */}
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'Nenhum evento encontrado' : 'Nenhum evento disponível'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {sortedEvents.map((event) => {
              const status = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.planejado;
              const isSelected = event.id === selectedEventId;

              return (
                <button
                  key={event.id}
                  onClick={() => onEventChange(event.id)}
                  className={cn(
                    "text-left p-4 rounded-lg border-2 transition-all hover:shadow-md",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="space-y-2">
                    {/* Nome do Evento */}
                    <h3 className={cn(
                      "font-semibold line-clamp-1",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {event.name}
                    </h3>

                    {/* Status */}
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>

                    {/* Informações do Evento */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {/* Datas */}
                      {event.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {formatDateBR(event.start_date)}
                            {event.end_date && ` - ${formatDateBR(event.end_date)}`}
                          </span>
                        </div>
                      )}

                      {/* Localização */}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}

                      {/* Cliente */}
                      {(event as any).client_contact_phone && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="line-clamp-1">Cliente: {(event as any).client_contact_phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Descrição */}
                    {event.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Indicador de Seleção */}
        {selectedEventId && !sortedEvents.find(e => e.id === selectedEventId) && (
          <p className="text-xs text-muted-foreground text-center">
            Evento selecionado não encontrado nos resultados da busca
          </p>
        )}
      </CardContent>
    </Card>
  );
};
