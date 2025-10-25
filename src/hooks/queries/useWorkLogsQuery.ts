import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { WorkRecord } from '@/contexts/EnhancedDataContext';
import { workLogsKeys } from './useWorkLogsRealtime';

// Fetch work logs for a team
const fetchWorkLogs = async (teamId: string): Promise<WorkRecord[]> => {
  const { data, error } = await supabase
    .from('work_records')
    .select('*')
    .eq('team_id', teamId);

  if (error) throw error;
  return (data || []) as WorkRecord[];
};

// Hook to get work logs for the active team
export const useWorkLogsQuery = () => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();

  return useQuery({
    queryKey: workLogsKeys.list(activeTeam?.id),
    queryFn: () => fetchWorkLogs(activeTeam!.id),
    enabled: !!user && !!activeTeam?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

// Hook to create new work log
export const useCreateWorkLogMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workLogData: Omit<WorkRecord, 'id' | 'created_at' | 'team_id'>) => {
      if (!activeTeam) throw new Error('No active team');

      const { data, error } = await supabase
        .from('work_records')
        .insert([{ ...workLogData, team_id: activeTeam.id }])
        .select()
        .single();

      if (error) throw error;
      return data as WorkRecord;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Registro de horas criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error creating work log:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar registro de horas",
        variant: "destructive"
      });
    },
  });
};

// Hook to update work log
export const useUpdateWorkLogMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workLog: WorkRecord) => {
      const { data, error } = await supabase
        .from('work_records')
        .update(workLog)
        .eq('id', workLog.id)
        .eq('team_id', activeTeam!.id)
        .select()
        .single();

      if (error) throw error;
      return data as WorkRecord;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Registro de horas atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error updating work log:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar registro de horas",
        variant: "destructive"
      });
    },
  });
};

// Hook to delete work log
export const useDeleteWorkLogMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workLogId: string) => {
      const { error } = await supabase
        .from('work_records')
        .delete()
        .eq('id', workLogId)
        .eq('team_id', activeTeam!.id);

      if (error) throw error;
      return workLogId;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Registro de horas excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao excluir registro de horas",
        variant: "destructive"
      });
    },
  });
};
