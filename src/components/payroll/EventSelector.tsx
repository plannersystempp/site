import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, ChevronRight, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { formatDateBR } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatters';
import type { Event } from '@/contexts/DataContext';
import { useTeam } from '@/contexts/TeamContext';
import { supabase } from '@/integrations/supabase/client';

interface EventSelectorProps {
  events: Event[];
  selectedEventId: string;
  onEventChange: (eventId: string) => void;
}

// Normaliza data para meio-dia local, evitando desvios por fuso/horário
const normalizeDate = (dateStr?: string) => {
  if (!dateStr) return null;
  return new Date(`${dateStr}T12:00:00`);
};

// Usa payment_due_date; se ausente, usa end_date como fallback
const getEffectiveDueDate = (event: Event): string | undefined => {
  return event.payment_due_date || event.end_date || undefined;
};

// Retorna true se o vencimento é hoje ou já passou (ignorando horário)
const isDueTodayOrPast = (dateStr?: string) => {
  const due = normalizeDate(dateStr);
  if (!due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueOnly = new Date(due);
  dueOnly.setHours(0, 0, 0, 0);
  return dueOnly.getTime() <= today.getTime();
};

// Retorna true se está dentro dos próximos 15 dias (inclui hoje)
const isDueWithin15Days = (dateStr?: string) => {
  const due = normalizeDate(dateStr);
  if (!due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(today.getDate() + 15);
  limit.setHours(23, 59, 59, 999);
  return due <= limit;
};

const getStatusConfig = (status: string) => {
  if (status === 'em_andamento') {
    return {
      label: 'Em Andamento',
      className: 'bg-indigo-500 text-white'
    };
  }
  if (status === 'concluido' || status === 'concluido_pagamento_pendente') {
    return {
      label: 'Concluído',
      className: 'bg-gray-400 text-white'
    };
  }
  return {
    label: 'Planejado',
    className: 'border-gray-300 text-gray-600'
  };
};

export const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  selectedEventId,
  onEventChange
}) => {
  const navigate = useNavigate();
  const { activeTeam } = useTeam();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('concluido_pagamento_pendente');
  const [pendingByEvent, setPendingByEvent] = useState<Record<string, number>>({});
  const [loadingPending, setLoadingPending] = useState<boolean>(false);

  // Carregar valores pendentes por evento a partir de event_payroll
  useEffect(() => {
    const fetchPending = async () => {
      if (!activeTeam) return;
      try {
        setLoadingPending(true);
        const { data, error } = await supabase
          .from('event_payroll')
          .select('event_id, remaining_balance')
          .eq('team_id', activeTeam.id);
        if (error) {
          console.error('Erro ao buscar event_payroll:', error);
          setPendingByEvent({});
          return;
        }
        // Somar remaining_balance por evento para evitar falsos positivos
        const map: Record<string, number> = {};
        (data || []).forEach((row: any) => {
          const amt = Number(row.remaining_balance || 0);
          map[row.event_id] = (map[row.event_id] || 0) + amt;
        });
        setPendingByEvent(map);
      } catch (e) {
        console.error('Falha ao carregar pendências:', e);
        setPendingByEvent({});
      } finally {
        setLoadingPending(false);
      }
    };
    fetchPending();
  }, [activeTeam]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const dueStr = getEffectiveDueDate(event);
      const dueTodayOrPast = isDueTodayOrPast(dueStr);
      const dueWithin15 = isDueWithin15Days(dueStr);
      const pendingAmount = pendingByEvent[event.id] ?? 0;

      // Regra para filtro "Pagamento Pendente":
      // - Excluir cancelados
      // - Incluir somente quando há valor pendente (>0), ignorando status
      //   para evitar falsos positivos em casos com status desatualizado.
      const hasPending = pendingAmount > 0;
      const matchesPendingFilter = (
        event.status !== 'cancelado' && hasPending
      );

      const matchesStatus =
        statusFilter === 'all' ||
        event.status === statusFilter ||
        (statusFilter === 'concluido_pagamento_pendente' && matchesPendingFilter);

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const dateA = new Date(a.start_date || '');
      const dateB = new Date(b.start_date || '');
      return dateB.getTime() - dateA.getTime();
    });
  }, [events, searchTerm, statusFilter, pendingByEvent]);

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
          const statusConfig = getStatusConfig(event.status);
          const dueStr = getEffectiveDueDate(event);
          const isDue = isDueTodayOrPast(dueStr);
          const pendingAmount = pendingByEvent[event.id] ?? 0;
          const showPendingBadge = pendingAmount > 0;
          // Sinalizar sempre quando vence hoje/atrasado e não concluído,
          // mesmo sem badge de pendência.
          const showDueWarning = (
            event.status === 'concluido_pagamento_pendente' ||
            (isDue && event.status !== 'concluido')
          );

          return (
            <Card 
              key={event.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
                selectedEventId === event.id ? 'ring-2 ring-primary border-primary' : 'border-border'
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
                  {showPendingBadge && (
                    <Badge className="bg-red-600 text-white">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {formatCurrency(pendingAmount)}
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
                {dueStr && (
                  <div className={`flex items-center gap-1.5 text-xs pt-1 ${
                    showDueWarning ? 'text-red-600 font-bold' : 'text-muted-foreground'
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {event.status === 'concluido_pagamento_pendente' ? 'Pendente' : 'Vence:'} {formatDateBR(dueStr)}
                    </span>
                  </div>
                )}

                {/* Click Action */}
                <div className="pt-1 border-t border-border/50">
                  <p className="text-xs text-primary flex items-center gap-1">
                    Clique para abrir folha
                    <ChevronRight className="h-3 w-3" />
                  </p>
                </div>

                {/* Loading hint for pending fetch */}
                {loadingPending && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Carregando pendências…</span>
                  </div>
                )}
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