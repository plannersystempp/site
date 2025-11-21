import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { useBroadcastInvalidation } from './useBroadcastInvalidation';
import type { Func } from '@/contexts/EnhancedDataContext';

// Query keys for consistent caching
export const functionKeys = {
  all: ['functions'] as const,
  lists: () => [...functionKeys.all, 'list'] as const,
  list: (teamId?: string) => [...functionKeys.lists(), { teamId }] as const,
  details: () => [...functionKeys.all, 'detail'] as const,
  detail: (id: string) => [...functionKeys.details(), id] as const,
};

// Fetch functions for a team
const fetchFunctions = async (teamId: string): Promise<Func[]> => {
  const { data, error } = await supabase
    .from('functions')
    .select('*')
    .eq('team_id', teamId)
    .order('name');

  if (error) throw error;

  return data.map(func => ({
    id: func.id,
    team_id: func.team_id,
    name: func.name || '',
    description: func.description || '',
    created_at: func.created_at || ''
  }));
};

// Hook to get functions for the active team
export const useFunctionsQuery = () => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();

  return useQuery({
    queryKey: functionKeys.list(activeTeam?.id),
    queryFn: () => fetchFunctions(activeTeam!.id),
    enabled: !!user && !!activeTeam?.id,
  });
};

// Hook to create a new function
export const useCreateFunctionMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();
  const { broadcast } = useBroadcastInvalidation();

  return useMutation({
    mutationFn: async (func: Omit<Func, 'id' | 'created_at' | 'team_id'>) => {
      if (!activeTeam) throw new Error('No active team');

      const { data, error } = await supabase
        .from('functions')
        .insert([{ ...func, team_id: activeTeam.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newFunc) => {
      await queryClient.cancelQueries({ queryKey: functionKeys.list(activeTeam?.id) });

      const previousFunctions = queryClient.getQueryData<Func[]>(functionKeys.list(activeTeam?.id));

      // Optimistically update
      if (previousFunctions && activeTeam) {
        const optimisticFunc: Func = {
          id: `temp-${Date.now()}`,
          team_id: activeTeam.id,
          created_at: new Date().toISOString(),
          ...newFunc,
        };

        queryClient.setQueryData<Func[]>(
          functionKeys.list(activeTeam.id),
          old => [...(old || []), optimisticFunc]
        );
      }

      return { previousFunctions };
    },
    onError: (err, newFunc, context) => {
      if (context?.previousFunctions && activeTeam) {
        queryClient.setQueryData(functionKeys.list(activeTeam.id), context.previousFunctions);
      }
      
      toast({
        title: "Erro",
        description: "Falha ao criar função",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      // ✅ FASE 2: Invalidar imediatamente + refetch ativo
      queryClient.invalidateQueries({ 
        queryKey: functionKeys.all,
        refetchType: 'active'
      });
      
      // ✅ FASE 3: Notificar outras abas
      broadcast(functionKeys.all);
      
      toast({
        title: "Sucesso",
        description: "Função criada com sucesso!",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: functionKeys.all,
        refetchType: 'none'
      });
    },
  });
};

// Hook to update a function
export const useUpdateFunctionMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();
  const { broadcast } = useBroadcastInvalidation();

  return useMutation({
    mutationFn: async (func: Func) => {
      const { data, error } = await supabase
        .from('functions')
        .update({
          name: func.name,
          description: func.description,
        })
        .eq('id', func.id)
        .eq('team_id', activeTeam!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (updatedFunc) => {
      await queryClient.cancelQueries({ queryKey: functionKeys.list(activeTeam?.id) });

      const previousFunctions = queryClient.getQueryData<Func[]>(functionKeys.list(activeTeam?.id));

      // Optimistically update
      if (previousFunctions && activeTeam) {
        queryClient.setQueryData<Func[]>(
          functionKeys.list(activeTeam.id),
          old => old?.map(func => func.id === updatedFunc.id ? updatedFunc : func) || []
        );
      }

      return { previousFunctions };
    },
    onError: (err, updatedFunc, context) => {
      if (context?.previousFunctions && activeTeam) {
        queryClient.setQueryData(functionKeys.list(activeTeam.id), context.previousFunctions);
      }
      
      toast({
        title: "Erro",
        description: "Falha ao atualizar função",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      // ✅ FASE 2: Invalidar imediatamente + refetch ativo
      queryClient.invalidateQueries({ 
        queryKey: functionKeys.all,
        refetchType: 'active'
      });
      
      // ✅ FASE 3: Notificar outras abas
      broadcast(functionKeys.all);
      
      toast({
        title: "Sucesso",
        description: "Função atualizada com sucesso!",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: functionKeys.all,
        refetchType: 'none'
      });
    },
  });
};

// Hook to delete a function
export const useDeleteFunctionMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();
  const { broadcast } = useBroadcastInvalidation();

  return useMutation({
    mutationFn: async (functionId: string) => {
      const { error } = await supabase
        .from('functions')
        .delete()
        .eq('id', functionId)
        .eq('team_id', activeTeam!.id);

      if (error) throw error;
      return functionId;
    },
    onMutate: async (functionId) => {
      await queryClient.cancelQueries({ queryKey: functionKeys.list(activeTeam?.id) });

      const previousFunctions = queryClient.getQueryData<Func[]>(functionKeys.list(activeTeam?.id));

      // Optimistically remove the function
      if (previousFunctions && activeTeam) {
        queryClient.setQueryData<Func[]>(
          functionKeys.list(activeTeam.id),
          old => old?.filter(func => func.id !== functionId) || []
        );
      }

      return { previousFunctions };
    },
    onError: (err, functionId, context) => {
      if (context?.previousFunctions && activeTeam) {
        queryClient.setQueryData(functionKeys.list(activeTeam.id), context.previousFunctions);
      }
      
      toast({
        title: "Erro",
        description: "Falha ao excluir função",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      // ✅ FASE 2: Invalidar imediatamente + refetch ativo
      queryClient.invalidateQueries({ 
        queryKey: functionKeys.all,
        refetchType: 'active'
      });
      
      // ✅ FASE 3: Notificar outras abas
      broadcast(functionKeys.all);
      
      toast({
        title: "Sucesso",
        description: "Função excluída com sucesso!",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: functionKeys.all,
        refetchType: 'none'
      });
    },
  });
};