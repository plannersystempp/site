
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, Users, Database, MoreVertical, Edit, Trash2, XCircle } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { NoTeamSelected } from '@/components/shared/NoTeamSelected';
import { EventForm } from './EventForm';
import { DataFetcher } from '@/contexts/data/dataFetcher';
import { useToast } from '@/hooks/use-toast';
import { ExportDropdown } from '@/components/shared/ExportDropdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const ManageEvents: React.FC = () => {
  const { events, assignments, personnel, deleteEvent } = useEnhancedData();
  const { activeTeam, userRole } = useTeam();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [sortOption, setSortOption] = useState<'date_newest' | 'date_oldest' | 'name_asc' | 'name_desc'>('date_newest');
  const [showForm, setShowForm] = useState(false);
  const [creatingExamples, setCreatingExamples] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const clearFilters = () => {
    setSearchTerm('');
    setPeriodStart('');
    setPeriodEnd('');
  };

  if (!activeTeam) {
    return (
      <NoTeamSelected
        title="Gestão de Eventos"
        description="Selecione uma equipe para começar a gerenciar eventos."
      />
    );
  }

  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      event.name.toLowerCase().includes(searchLower) ||
      (event.description || '').toLowerCase().includes(searchLower) ||
      (event.location || '').toLowerCase().includes(searchLower) ||
      (event.client_contact_phone || '').toLowerCase().includes(searchLower)
    );

    // Filtragem por período (sobreposição entre [start_date, end_date] e [periodStart, periodEnd])
    const start = event.start_date || '';
    const end = event.end_date || '';
    let matchesPeriod = true;
    if (periodStart && periodEnd) {
      matchesPeriod = (start <= periodEnd) && (end >= periodStart);
    } else if (periodStart && !periodEnd) {
      matchesPeriod = end >= periodStart;
    } else if (!periodStart && periodEnd) {
      matchesPeriod = start <= periodEnd;
    }

    return matchesSearch && matchesPeriod;
  });

  // Ordenação baseada na opção selecionada
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return a.name.localeCompare(b.name, 'pt-BR');
      case 'name_desc':
        return b.name.localeCompare(a.name, 'pt-BR');
      case 'date_oldest': {
        const timeA = Date.parse(a.start_date || a.end_date || a.created_at || '') || 0;
        const timeB = Date.parse(b.start_date || b.end_date || b.created_at || '') || 0;
        return timeA - timeB;
      }
      case 'date_newest':
      default: {
        const timeA = Date.parse(a.start_date || a.end_date || a.created_at || '') || 0;
        const timeB = Date.parse(b.start_date || b.end_date || b.created_at || '') || 0;
        return timeB - timeA;
      }
    }
  });

  const getEventStats = (eventId: string) => {
    const eventAssignments = assignments.filter(a => a.event_id === eventId);
    const uniquePersonnel = new Set(eventAssignments.map(a => a.personnel_id));
    return {
      totalPeople: uniquePersonnel.size,
      totalAssignments: eventAssignments.length
    };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const canManageEvents = userRole === 'admin';

  const handleCreateSampleData = async () => {
    if (!user || !activeTeam) return;

    try {
      setCreatingExamples(true);
      console.log('Creating sample data for team:', activeTeam.id);
      
      const success = await DataFetcher.createSampleData(activeTeam.id, user.id);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Dados de exemplo criados com sucesso!",
        });
        // Recarregar os dados após criar exemplos
        // Data will auto-refresh via EnhancedDataContext
      } else {
        toast({
          title: "Erro",
          description: "Falha ao criar dados de exemplo",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar dados de exemplo",
        variant: "destructive"
      });
    } finally {
      setCreatingExamples(false);
    }
  };

  const handleFormSuccess = async () => {
    console.log('Event form submitted successfully, refreshing data...');
    // Data will auto-refresh via EnhancedDataContext
    setShowForm(false);
    setEditingEvent(null);
    setSearchTerm(''); // Clear search filter to ensure new event is visible
  };

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    try {
      await deleteEvent(eventId);
      toast({
        title: "Sucesso",
        description: `Evento "${eventName}" excluído com sucesso!`,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir evento",
        variant: "destructive"
      });
    }
  };

  // Preparar dados para exportação
  const exportData = filteredEvents.map(event => {
    const stats = getEventStats(event.id);
    return {
      nome: event.name,
      descricao: event.description || '',
      status: event.status || 'planejado',
      data_inicio: formatDate(event.start_date),
      data_fim: formatDate(event.end_date),
      pessoas_alocadas: stats.totalPeople,
      total_alocacoes: stats.totalAssignments,
      criado_em: new Date(event.created_at).toLocaleDateString('pt-BR'),
    };
  });

  const exportHeaders = ['nome', 'descricao', 'status', 'data_inicio', 'data_fim', 'pessoas_alocadas', 'total_alocacoes', 'criado_em'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Eventos</h1>
          <p className="text-muted-foreground">Equipe: {activeTeam.name}</p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown
            data={exportData}
            headers={exportHeaders}
            filename="eventos_filtrados"
            title="Relatório de Eventos"
            disabled={filteredEvents.length === 0}
          />
          {canManageEvents && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Evento
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-[240px] sm:min-w-[280px] sm:max-w-none">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, descrição, local ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <Input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            placeholder="Data inicial"
            className="w-[140px] sm:w-[160px]"
          />
          <span className="text-muted-foreground text-sm">até</span>
          <Input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            placeholder="Data final"
            className="w-[140px] sm:w-[160px]"
          />
          <Button variant="outline" onClick={clearFilters} className="ml-2">
            <XCircle className="w-4 h-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Limpar filtro</span>
          </Button>
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as typeof sortOption)}>
            <SelectTrigger className="w-[200px] md:w-[220px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_newest">Data: mais recente</SelectItem>
              <SelectItem value="date_oldest">Data: mais antiga</SelectItem>
              <SelectItem value="name_asc">Nome: A–Z</SelectItem>
              <SelectItem value="name_desc">Nome: Z–A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title="Nenhum evento encontrado"
          description={
            searchTerm 
              ? "Tente ajustar os termos de busca" 
              : events.length === 0 
                ? "Crie seu primeiro evento para começar" 
                : "Nenhum evento corresponde à sua busca"
          }
          action={canManageEvents && events.length === 0 ? {
            label: "Criar Primeiro Evento",
            onClick: () => setShowForm(true)
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => {
            const stats = getEventStats(event.id);
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <StatusBadge status={event.status || 'planejado'} />
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{stats.totalPeople} pessoas alocadas</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/app/eventos/${event.id}`)}
                        className="flex-1"
                      >
                        Ver Detalhes
                      </Button>
                      {canManageEvents && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingEvent(event)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o evento "{event.name}"? 
                                    Esta ação não pode ser desfeita e removerá todas as alocações e registros relacionados.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteEvent(event.id, event.name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {(showForm || editingEvent) && (
        <EventForm
          event={editingEvent}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};
