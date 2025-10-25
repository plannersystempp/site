import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Assignment } from '@/contexts/EnhancedDataContext';
import { allocationsKeys } from './useAllocationsRealtime';

// Fetch allocations for a team
const fetchAllocations = async (teamId: string): Promise<Assignment[]> => {
  const { data, error } = await supabase
    .from('personnel_allocations')
    .select('*')
    .eq('team_id', teamId);

  if (error) throw error;
  return (data || []) as Assignment[];
};

// Hook to get allocations for the active team
export const useAllocationsQuery = () => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();

  return useQuery({
    queryKey: allocationsKeys.list(activeTeam?.id),
    queryFn: () => fetchAllocations(activeTeam!.id),
    enabled: !!user && !!activeTeam?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

// Hook to create new allocation
export const useCreateAllocationMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (allocationData: Omit<Assignment, 'id' | 'created_at' | 'team_id'>) => {
      if (!activeTeam) throw new Error('No active team');

      const { data, error } = await supabase
        .from('personnel_allocations')
        .insert([{ ...allocationData, team_id: activeTeam.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Assignment;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Alocação criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error creating allocation:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar alocação",
        variant: "destructive"
      });
    },
  });
};

// Hook to delete allocation
export const useDeleteAllocationMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (allocationId: string) => {
      const { error } = await supabase
        .from('personnel_allocations')
        .delete()
        .eq('id', allocationId)
        .eq('team_id', activeTeam!.id);

      if (error) throw error;
      return allocationId;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Alocação excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao excluir alocação",
        variant: "destructive"
      });
    },
  });
};
