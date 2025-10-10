import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, ChevronRight, Clock, DollarSign } from 'lucide-react';
import { formatDateBR } from '@/utils/dateUtils';
import type { Event } from '@/contexts/DataContext';

interface EventSelectorProps {
  events: Event[];
  selectedEventId: string;
  onEventChange: (eventId: string) => void;
}

// Helper function to check if a date is in the past (timezone-safe)
const isDatePast = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const date = new Date(`${dateStr}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const getStatusConfig = (status: string, paymentDueDate?: string) => {
  const isPastDue = isDatePast(paymentDueDate);
  
  if (status === 'em_andamento') {
    return {
      label: 'Em Andamento',
      variant: 'default' as const,
      className: 'bg-indigo-500 text-white'
    };
  }
  if (status === 'concluido' || status === 'concluido_pagamento_pendente') {
    return {
      label: 'Concluído',
      variant: 'secondary' as const,
      className: 'bg-gray-400 text-white'
    };
  }
  return {
    label: 'Planejado',
    variant: 'outline' as const,
    className: 'border-gray-300 text-gray-600'
  };
};

const getPaymentStatus = (status: string, paymentDueDate?: string) => {
  const isPastDue = isDatePast(paymentDueDate);
  
  // Apenas mostrar "Pagamento Devido" se há pendências de pagamento
  if (status === 'concluido_pagamento_pendente') {
    return {
      label: 'Pagamento Devido',
      className: 'bg-red-500 text-white'
    };
  }
  
  // Se data venceu mas status é 'concluido' (totalmente pago), não mostrar badge
  if (isPastDue && status !== 'concluido') {
    return {
      label: 'Pagamento Devido',
      className: 'bg-red-500 text-white'
    };
  }
  
  return null;
};

export const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  selectedEventId,
  onEventChange
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const dateA = new Date(a.start_date || '');
      const dateB = new Date(b.start_date || '');
      return dateB.getTime() - dateA.getTime();
    });
  }, [events, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="planejado">Planejado</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="concluido_pagamento_pendente">Pagamento Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Event Count */}
      <p className="text-sm text-muted-foreground">
        {filteredEvents.length} {filteredEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
      </p>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => {
          const statusConfig = getStatusConfig(event.status, event.payment_due_date);
          const paymentStatus = getPaymentStatus(event.status, event.payment_due_date);
          const isSelected = selectedEventId === event.id;
          // Destaque vermelho se: pagamento pendente OU vencido (exceto se totalmente pago)
          const showDueRed = event.status === 'concluido_pagamento_pendente' || 
                            (isDatePast(event.payment_due_date) && event.status !== 'concluido');

          return (
            <Card 
              key={event.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
                isSelected ? 'ring-2 ring-primary border-primary' : 'border-border'
              }`}
              onClick={() => navigate(`/app/folha/${event.id}`)}
            >
              <CardContent className="p-3 space-y-2.5">
                {/* Event Name with Chevron */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base line-clamp-2 flex-1 text-foreground">
                    {event.name}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {event.start_date && formatDateBR(event.start_date)}
                    {event.end_date && event.start_date !== event.end_date && 
                      ` - ${formatDateBR(event.end_date)}`}
                  </span>
                </div>

                {/* Status Badges - Horizontal */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                  {paymentStatus && (
                    <Badge className={paymentStatus.className}>
                      <DollarSign className="h-3 w-3 mr-1" />
                      {paymentStatus.label}
                    </Badge>
                  )}
                </div>

                {/* Additional Info */}
                {(event.location || event.client_contact_phone) && (
                  <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
                    {event.location && (
                      <p className="line-clamp-1">📍 {event.location}</p>
                    )}
                    {event.client_contact_phone && (
                      <p className="line-clamp-1">📞 {event.client_contact_phone}</p>
                    )}
                  </div>
                )}

                {/* Payment Due Date - Highlighted */}
                {event.payment_due_date && (
                  <div className={`flex items-center gap-1.5 text-xs pt-1 ${
                    showDueRed ? 'text-red-600 font-bold' : 'text-muted-foreground'
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>Vencimento: {formatDateBR(event.payment_due_date)}</span>
                  </div>
                )}

                {/* Click Action */}
                <div className="pt-1 border-t border-border/50">
                  <p className="text-xs text-primary flex items-center gap-1">
                    Clique para abrir folha
                    <ChevronRight className="h-3 w-3" />
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum evento encontrado</p>
        </div>
      )}
    </div>
  );
};
