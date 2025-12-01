import React, { useMemo, useState, useEffect } from 'react';
import { useEnhancedData, type Personnel, type Func } from '@/contexts/EnhancedDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePersonnelQuery, useDeletePersonnelMutation } from '@/hooks/queries/usePersonnelQuery';
import { usePersonnelRealtime } from '@/hooks/queries/usePersonnelRealtime';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Users } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PersonnelForm } from './PersonnelForm';
import { PersonnelStats } from './PersonnelStats';
import { PersonnelFilters } from './PersonnelFilters';
import { supabase } from '@/integrations/supabase/client';
import { PersonnelList } from './PersonnelList';
import { PersonnelViewToggle } from './PersonnelViewToggle';
import { ExportDropdown } from '@/components/shared/ExportDropdown';
import { FreelancerRatingDialog } from './FreelancerRatingDialog';
import { useCheckSubscriptionLimits } from '@/hooks/useCheckSubscriptionLimits';
import { UpgradePrompt } from '@/components/subscriptions/UpgradePrompt';
import { useTeam } from '@/contexts/TeamContext';

export const ManagePersonnel: React.FC = () => {
  const { functions } = useEnhancedData();
  const { data: personnel = [], isFetching, isLoading } = usePersonnelQuery();
  const deletePersonnelMutation = useDeletePersonnelMutation();
  
  // Hook de sincronização em tempo real
  usePersonnelRealtime();
  const { user } = useAuth();
  const { activeTeam } = useTeam();
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fixo' | 'freelancer'>('all');
  const [filterFunction, setFilterFunction] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'rating_desc' | 'rating_asc'>('name_asc');
  const [ratingsAvg, setRatingsAvg] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [ratingPersonnel, setRatingPersonnel] = useState<Personnel | null>(null);
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [limitCheckResult, setLimitCheckResult] = useState<any>(null);
  const checkLimits = useCheckSubscriptionLimits();

  // Force grid view on mobile for better responsiveness
  const effectiveViewMode = isMobile ? 'grid' : viewMode;

  // Filter personnel based on search term, type, and function
  useEffect(() => {
    const teamId = activeTeam?.id;
    if (!teamId) return;
    supabase
      .from('freelancer_ratings')
      .select('freelancer_id, rating')
      .eq('team_id', teamId)
      .then(({ data, error }) => {
        if (error) return;
        const acc: Record<string, { sum: number; count: number }> = {};
        for (const row of (data || [])) {
          const id = (row as any).freelancer_id as string;
          const rating = (row as any).rating as number;
          if (!acc[id]) acc[id] = { sum: 0, count: 0 };
          acc[id].sum += rating || 0;
          acc[id].count += 1;
        }
        const avg: Record<string, number> = {};
        Object.keys(acc).forEach(id => {
          avg[id] = acc[id].count > 0 ? acc[id].sum / acc[id].count : 0;
        });
        setRatingsAvg(avg);
      });
  }, [activeTeam]);

  // Atualização em tempo real das médias de avaliação
  useEffect(() => {
    const teamId = activeTeam?.id;
    if (!teamId) return;

    const refetchAverages = async () => {
      const { data, error } = await supabase
        .from('freelancer_ratings')
        .select('freelancer_id, rating')
        .eq('team_id', teamId);
      if (error) return;
      const acc: Record<string, { sum: number; count: number }> = {};
      for (const row of (data || [])) {
        const id = (row as any).freelancer_id as string;
        const rating = (row as any).rating as number;
        if (!acc[id]) acc[id] = { sum: 0, count: 0 };
        acc[id].sum += rating || 0;
        acc[id].count += 1;
      }
      const avg: Record<string, number> = {};
      Object.keys(acc).forEach(id => {
        avg[id] = acc[id].count > 0 ? acc[id].sum / acc[id].count : 0;
      });
      setRatingsAvg(avg);
    };

    const channel = supabase
      .channel(`manage_personnel_ratings_${teamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'freelancer_ratings',
        filter: `team_id=eq.${teamId}`
      }, () => {
        refetchAverages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTeam]);

  const filteredPersonnel = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return personnel.filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(term) || person.email?.toLowerCase().includes(term);
      const matchesType = filterType === 'all' || person.type === filterType;
      const matchesFunction = filterFunction === 'all' || (person.functions && person.functions.some(f => f.id === filterFunction));
      return matchesSearch && matchesType && matchesFunction;
    });
  }, [personnel, searchTerm, filterType, filterFunction]);

  const sortedPersonnel = useMemo(() => {
    const arr = [...filteredPersonnel];
    const cmpNameAsc = (a: Personnel, b: Personnel) => a.name.localeCompare(b.name, 'pt-BR');
    const getRating = (p: Personnel) => (p.type === 'freelancer' ? (ratingsAvg[p.id] ?? 0) : 0);
    if (sortBy === 'name_asc') arr.sort(cmpNameAsc);
    else if (sortBy === 'name_desc') arr.sort((a, b) => cmpNameAsc(b, a));
    else if (sortBy === 'rating_desc') arr.sort((a, b) => getRating(b) - getRating(a) || cmpNameAsc(a, b));
    else if (sortBy === 'rating_asc') arr.sort((a, b) => getRating(a) - getRating(b) || cmpNameAsc(a, b));
    return arr;
  }, [filteredPersonnel, sortBy, ratingsAvg]);
  const handleEdit = (person: Personnel) => {
    setEditingPersonnel(person);
    setShowForm(true);
  };
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta pessoa?')) {
      await deletePersonnelMutation.mutateAsync(id);
    }
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPersonnel(null);
  };
  const handleRating = (person: Personnel) => {
    if (person.type === 'freelancer') {
      setRatingPersonnel(person);
    }
  };

  const isAdminOrCoordinator = user?.role === 'admin' || user?.role === 'coordinator';
  
  // Debug: Log user role
  useEffect(() => {
    console.log('[ManagePersonnel] User:', user);
    console.log('[ManagePersonnel] User role:', user?.role);
    console.log('[ManagePersonnel] isAdminOrCoordinator:', isAdminOrCoordinator);
  }, [user, isAdminOrCoordinator]);

  const handleAddPersonnel = async () => {
    if (!activeTeam) return;

    try {
      const result = await checkLimits.mutateAsync({
        teamId: activeTeam.id,
        action: 'add_personnel'
      });

      if (!result.can_proceed) {
        setLimitCheckResult(result);
        setUpgradePromptOpen(true);
        return;
      }

      setShowForm(true);
    } catch (error) {
      console.error('Error checking limits:', error);
      setShowForm(true); // Allow creation if check fails
    }
  };

  // Preparar dados para exportação
  const exportData = filteredPersonnel.map(person => ({
    nome: person.name,
    email: person.email || '',
    telefone: person.phone || '',
    tipo: person.type,
    funcoes: person.functions?.map(f => f.name).join(', ') || '',
    salario_mensal: person.monthly_salary || 0,
    cache_evento: person.event_cache || 0,
    valor_hora_extra: person.overtime_rate || 0
  }));
  const exportHeaders = ['nome', 'email', 'telefone', 'tipo', 'funcoes', 'salario_mensal', 'cache_evento', 'valor_hora_extra'];
  return <div className="min-h-screen w-full max-w-full p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 box-border py-[2px] px-[2px]">
      <div className="space-y-4">
        <div className="flex flex-col space-y-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Gestão de Pessoal</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie toda a equipe da organização</p>
        </div>
        
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
        <div className="order-2 sm:order-1 w-full sm:flex-1">
          <ExportDropdown
            data={exportData}
            headers={exportHeaders}
            filename="pessoal_filtrado"
            title="Relatório de Pessoal"
            disabled={filteredPersonnel.length === 0}
          />
        </div>
        {isAdminOrCoordinator && (
          <Button onClick={handleAddPersonnel} className="order-1 sm:order-2 w-full sm:w-auto" size="default">
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Pessoa
          </Button>
        )}
      </div>
      </div>

      <PersonnelStats personnel={personnel} />

      <PersonnelFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} filterType={filterType} onTypeChange={setFilterType} filterFunction={filterFunction} onFunctionChange={setFilterFunction} functions={functions} sortBy={sortBy} onSortChange={setSortBy} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {filteredPersonnel.length} pessoa(s) encontrada(s)
          {isFetching && !isLoading && (
            <span className="ml-2 text-xs text-primary">
              • Atualizando...
            </span>
          )}
        </div>
        <div className="order-1 sm:order-2 w-full sm:w-auto">
          {!isMobile && (
            <PersonnelViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          )}
        </div>
      </div>

      {filteredPersonnel.length === 0 ? <EmptyState icon={<Users className="w-12 h-12" />} title="Nenhuma pessoa encontrada" description={searchTerm || filterType !== 'all' || filterFunction !== 'all' ? "Tente ajustar os filtros de busca" : "Cadastre a primeira pessoa para começar"} action={isAdminOrCoordinator ? {
      label: "Cadastrar Primeira Pessoa",
      onClick: () => setShowForm(true)
    } : undefined} /> : <div className="w-full">
          <PersonnelList 
            personnel={sortedPersonnel} 
            functions={functions} 
            viewMode={effectiveViewMode} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            canEdit={() => isAdminOrCoordinator}
            onRate={isAdminOrCoordinator ? handleRating : undefined}
          />
        </div>}

      {showForm && <PersonnelForm personnel={editingPersonnel} onClose={handleCloseForm} onSuccess={handleCloseForm} />}

      {ratingPersonnel && (
        <FreelancerRatingDialog
          freelancerId={ratingPersonnel.id}
          freelancerName={ratingPersonnel.name}
          open={!!ratingPersonnel}
          onOpenChange={(open) => {
            if (!open) setRatingPersonnel(null);
          }}
          onRatingSubmitted={() => setRatingPersonnel(null)}
        />
      )}

      <UpgradePrompt
        open={upgradePromptOpen}
        onOpenChange={setUpgradePromptOpen}
        reason={limitCheckResult?.reason || ''}
        currentPlan={limitCheckResult?.current_plan}
        limit={limitCheckResult?.limit}
        currentCount={limitCheckResult?.current_count}
      />
    </div>;
};
