import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { fetchPersonnelByRole } from '@/services/personnelService';
import { supabase } from '@/integrations/supabase/client';
import type { Personnel } from '@/contexts/EnhancedDataContext';
import { sanitizePersonnelData } from '@/utils/dataTransform';

// Query keys for consistent caching (SIMPLIFIED)
export const personnelKeys = {
  all: ['personnel'] as const,
  list: (teamId?: string) => ['personnel', 'list', teamId] as const,
  detail: (id: string) => ['personnel', 'detail', id] as const,
};

// Personnel form data interface
interface PersonnelFormData {
  name: string;
  email: string;
  phone: string;
  type: 'fixo' | 'freelancer';
  monthly_salary: number;
  event_cache: number;
  overtime_rate: number;
  cpf: string;
  cnpj: string;
  functionIds: string[];
  primaryFunctionId?: string;
  pixKey?: string;
  photo_url?: string;
  shirt_size?: string;
  address_zip_code?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  phone_secondary?: string;
}

// FASE 2: Fetch personnel usando RPC otimizada (1 query em vez de 2)
const fetchPersonnelWithFunctions = async (teamId: string, userRole?: string | null): Promise<Personnel[]> => {
  console.log('[fetchPersonnelWithFunctions] Using optimized RPC for team:', teamId, 'userRole:', userRole);
  
  try {
    // Para admins e superadmins, usar RPC otimizada que faz JOIN no banco
    if (userRole === 'admin' || userRole === 'superadmin') {
      console.log('[fetchPersonnelWithFunctions] Admin/superadmin - using RPC get_personnel_with_functions');
      
      const { data, error } = await supabase.rpc('get_personnel_with_functions', {
        p_team_id: teamId
      });

      if (error) {
        console.error('[fetchPersonnelWithFunctions] RPC error:', error);
        throw error;
      }

      console.log('[fetchPersonnelWithFunctions] RPC returned:', data?.length || 0, 'records');
      
      // Transform RPC result to Personnel format
      const personnelWithFunctions: Personnel[] = (data || []).map(person => {
        // Parse functions JSONB to array
        let parsedFunctions: any[] = [];
        if (person.functions) {
          try {
            parsedFunctions = typeof person.functions === 'string' 
              ? JSON.parse(person.functions)
              : person.functions as any[];
          } catch (e) {
            console.error('[fetchPersonnelWithFunctions] Error parsing functions:', e);
            parsedFunctions = [];
          }
        }

        return {
          ...person,
          functions: parsedFunctions,
          primaryFunctionId: person.primary_function_id,
          type: (person.type === 'fixo' || person.type === 'freelancer') ? person.type : 'freelancer',
          shirt_size: person.shirt_size as Personnel['shirt_size'] || undefined,
          monthly_salary: person.monthly_salary || 0,
          event_cache: person.event_cache || 0,
          overtime_rate: person.overtime_rate || 0,
        };
      });

      return personnelWithFunctions;
    }

    // Para coordinators (dados redacted), manter lógica antiga de 2 queries
    console.log('[fetchPersonnelWithFunctions] Non-admin - using legacy 2-query approach');
    const personnelData = await fetchPersonnelByRole(teamId, userRole);
    console.log('[fetchPersonnelWithFunctions] Personnel data fetched:', personnelData.length, 'records');
    
    // Fetch personnel functions associations
    const { data: personnelFunctionsData, error: personnelFunctionsError } = await supabase
      .from('personnel_functions')
      .select('personnel_id, function_id, is_primary, functions:function_id(id, name, description)')
      .eq('team_id', teamId);

    if (personnelFunctionsError) {
      console.error('[fetchPersonnelWithFunctions] Error fetching personnel functions:', personnelFunctionsError);
    }

    // Map personnel with their functions
    const personnelWithFunctions: Personnel[] = personnelData.map(person => {
      const personFunctionRows = (personnelFunctionsData || [])
        .filter(pf => pf.personnel_id === person.id);

      const primaryFunctionId = personFunctionRows.find(pf => (pf as any).is_primary)?.function_id as string | undefined;

      const personFunctions = personFunctionRows
        .map(pf => pf.functions)
        .filter(f => f != null) as any[];

      const orderedFunctions = primaryFunctionId
        ? personFunctions.sort((a, b) => (a.id === primaryFunctionId ? -1 : b.id === primaryFunctionId ? 1 : 0))
        : personFunctions;

      return {
        ...person,
        functions: orderedFunctions,
        primaryFunctionId,
        type: (person.type === 'fixo' || person.type === 'freelancer') ? person.type : 'freelancer',
        monthly_salary: person.monthly_salary || 0,
        event_cache: person.event_cache || 0,
        overtime_rate: person.overtime_rate || 0,
      };
    });

    console.log('[fetchPersonnelWithFunctions] Personnel with functions processed:', personnelWithFunctions.length, 'records');
    return personnelWithFunctions;
  } catch (error) {
    console.error('[fetchPersonnelWithFunctions] Error:', error);
    throw error;
  }
};

// Hook to get personnel for the active team (OTIMIZADO - sem cache-busting desnecessário)
export const usePersonnelQuery = () => {
  const { user } = useAuth();
  const { activeTeam, userRole } = useTeam();

  return useQuery({
    queryKey: personnelKeys.list(activeTeam?.id),
    queryFn: async () => {
      // Passar userRole para evitar RPCs redundantes
      const personnel = await fetchPersonnelWithFunctions(activeTeam!.id, userRole);
      // Usar created_at como cache-bust estável (não muda em cada refetch)
      return personnel.map(p => ({
        ...p,
        photo_url: p.photo_url && p.created_at 
          ? `${p.photo_url.split('?')[0]}?v=${new Date(p.created_at).getTime()}`
          : p.photo_url
      }));
    },
    enabled: !!user && !!activeTeam?.id,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: 'always', // Garantir dados frescos ao abrir modals
    refetchOnWindowFocus: false,
  });
};

// Hook to create new personnel
export const useCreatePersonnelMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (personnelData: PersonnelFormData) => {
      console.log('[CREATE MUTATION] Starting creation:', personnelData);
      if (!activeTeam) throw new Error('No active team');

      const { functionIds, pixKey, primaryFunctionId, ...restData } = personnelData;
      
      // Usar utilitário centralizado de sanitização
      const sanitizedData = sanitizePersonnelData(restData);

      const dataToInsert: any = {
        ...sanitizedData,
        team_id: activeTeam.id
      };
      
      // Create personnel record
      const { data: personnelResult, error: personnelError } = await supabase
        .from('personnel')
        .insert([dataToInsert])
        .select()
        .single();

      if (personnelError) throw personnelError;

      // Handle PIX key if provided
      if (pixKey && pixKey.trim()) {
        try {
          await supabase.functions.invoke('pix-key', {
            body: {
              personnelId: personnelResult.id,
              pixKey: pixKey.trim()
            }
          });
        } catch (pixError) {
          console.warn('PIX key could not be saved:', pixError);
          // Don't fail the entire operation for PIX key issues
        }
      }

      // Associate functions if provided
      if (functionIds && functionIds.length > 0) {
        const functionAssociations = functionIds.map(functionId => ({
          personnel_id: personnelResult.id,
          function_id: functionId,
          team_id: activeTeam.id,
          is_primary: primaryFunctionId ? functionId === primaryFunctionId : functionIds.length === 1 ? functionId === functionIds[0] : false
        }));

        const { error: functionsError } = await supabase
          .from('personnel_functions')
          .insert(functionAssociations);

        if (functionsError) {
          console.warn('Some functions could not be associated:', functionsError);
          // Don't fail the entire operation for function association issues
        }
      }

      return personnelResult;
    },
    onMutate: async (data: PersonnelFormData) => {
      console.log('[CREATE MUTATION] onMutate - Optimistic creation:', data.name);
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: personnelKeys.list(activeTeam!.id) });

      // Snapshot the previous value
      const previousPersonnel = queryClient.getQueryData<Personnel[]>(personnelKeys.list(activeTeam!.id));

      // Optimistically update to the new value
      if (previousPersonnel) {
        const optimisticPersonnel: Personnel = {
          id: `temp-${Date.now()}`,
          team_id: activeTeam!.id,
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          type: data.type,
          monthly_salary: data.monthly_salary || 0,
          event_cache: data.event_cache || 0,
          overtime_rate: data.overtime_rate || 0,
          cpf: data.cpf || undefined,
          cnpj: data.cnpj || undefined,
          photo_url: data.photo_url || undefined,
          shirt_size: (data.shirt_size as 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG') || undefined,
          address_zip_code: data.address_zip_code || undefined,
          address_street: data.address_street || undefined,
          address_number: data.address_number || undefined,
          address_complement: data.address_complement || undefined,
          address_neighborhood: data.address_neighborhood || undefined,
          address_city: data.address_city || undefined,
          address_state: data.address_state || undefined,
          primaryFunctionId: data.primaryFunctionId || undefined,
          functions: [],
          created_at: new Date().toISOString(),
        };

        // CORREÇÃO: Garantir que o placeholder seja adicionado imediatamente
        const updatedData = [...previousPersonnel, optimisticPersonnel];
        queryClient.setQueryData<Personnel[]>(
          personnelKeys.list(activeTeam!.id),
          updatedData
        );
        
        console.log('[CREATE MUTATION] onMutate - Optimistic personnel added to cache:', optimisticPersonnel.id);
      }

      return { previousPersonnel };
    },
    onSuccess: (data) => {
      console.log('[CREATE] Success:', data.id);
      // Realtime handles cache synchronization automatically
      
      toast({
        title: "Sucesso",
        description: "Pessoal adicionado com sucesso!",
      });
    },
    onError: (error, data, context) => {
      // Rollback to previous state on error
      if (context?.previousPersonnel) {
        queryClient.setQueryData(
          personnelKeys.list(activeTeam!.id),
          context.previousPersonnel
        );
      }
      
      console.error('Error creating personnel:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar pessoal",
        variant: "destructive"
      });
    },
  });
};

// Hook to update personnel
export const useUpdatePersonnelMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...personnelData }: { id: string } & Partial<PersonnelFormData>) => {
      console.log('[UPDATE MUTATION] Starting update for:', id, personnelData);
      const { functionIds, pixKey, primaryFunctionId, ...restData } = personnelData;

      // Usar utilitário centralizado de sanitização
      const dataToUpdate = sanitizePersonnelData(restData);

      // Update personnel record
      const { data, error } = await supabase
        .from('personnel')
        .update(dataToUpdate)
        .eq('id', id)
        .eq('team_id', activeTeam!.id)
        .select()
        .single();

      if (error) throw error;

      // Handle PIX key update if provided
      if (pixKey !== undefined) {
        try {
          await supabase.functions.invoke('pix-key', {
            body: {
              personnelId: id,
              pixKey: pixKey.trim() || null
            }
          });
        } catch (pixError) {
          console.warn('PIX key could not be updated:', pixError);
        }
      }

      // Update function associations if provided
      if (functionIds !== undefined) {
        // Remove existing associations
        await supabase
          .from('personnel_functions')
          .delete()
          .eq('personnel_id', id)
          .eq('team_id', activeTeam!.id);

        // Add new associations
        if (functionIds.length > 0) {
          const functionAssociations = functionIds.map(functionId => ({
            personnel_id: id,
            function_id: functionId,
            team_id: activeTeam!.id,
            is_primary: primaryFunctionId ? functionId === primaryFunctionId : functionIds.length === 1 ? functionId === functionIds[0] : false
          }));

          await supabase
            .from('personnel_functions')
            .insert(functionAssociations);
        }
      }

      return data;
    },
    onMutate: async ({ id, ...data }) => {
      console.log('[UPDATE MUTATION] onMutate - Optimistic update for:', id, data);
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: personnelKeys.list(activeTeam!.id) });

      // Snapshot the previous value
      const previousPersonnel = queryClient.getQueryData<Personnel[]>(personnelKeys.list(activeTeam!.id));

      // Optimistically update to the new value
      if (previousPersonnel) {
        queryClient.setQueryData<Personnel[]>(
          personnelKeys.list(activeTeam!.id),
          previousPersonnel.map(p => 
            p.id === id 
              ? { 
                  ...p, 
                  ...data
                } as Personnel
              : p
          )
        );
        console.log('[UPDATE MUTATION] onMutate - Cache updated optimistically');
      }

      return { previousPersonnel };
    },
    onSuccess: (data) => {
      console.log('[UPDATE] Success:', data?.id);
      // Realtime handles cache synchronization automatically
      
      toast({
        title: "Sucesso",
        description: "Pessoal atualizado com sucesso!",
      });
    },
    onError: (error, { id }, context) => {
      // Rollback to previous state on error
      if (context?.previousPersonnel) {
        queryClient.setQueryData(
          personnelKeys.list(activeTeam!.id),
          context.previousPersonnel
        );
      }
      
      console.error('Error updating personnel:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar pessoal",
        variant: "destructive"
      });
    },
  });
};

// Hook to delete personnel
export const useDeletePersonnelMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (personnelId: string) => {
      console.log('[DELETE PERSONNEL] Starting deletion for ID:', personnelId);
      console.log('[DELETE PERSONNEL] Active team:', activeTeam?.id);
      
      const { data, error } = await supabase
        .from('personnel')
        .delete()
        .eq('id', personnelId)
        .eq('team_id', activeTeam!.id)
        .select(); // Add select to get deleted data

      console.log('[DELETE PERSONNEL] Supabase response:', { data, error });
      
      if (error) {
        console.error('[DELETE PERSONNEL] Error occurred:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('[DELETE PERSONNEL] No rows were deleted. Personnel may not exist or user lacks permissions.');
        throw new Error('Nenhum registro foi excluído. Verifique se o pessoal existe e se você tem permissões.');
      }
      
      console.log('[DELETE PERSONNEL] Successfully deleted:', data);
      return personnelId;
    },
    onMutate: async (personnelId) => {
      console.log('[DELETE PERSONNEL] onMutate - Starting optimistic update for:', personnelId);
      await queryClient.cancelQueries({ queryKey: personnelKeys.list(activeTeam?.id) });

      const previousPersonnel = queryClient.getQueryData<Personnel[]>(personnelKeys.list(activeTeam?.id));

      // Optimistically remove the personnel
      if (previousPersonnel && activeTeam) {
        queryClient.setQueryData<Personnel[]>(
          personnelKeys.list(activeTeam.id),
          old => old?.filter(person => person.id !== personnelId) || []
        );
        console.log('[DELETE PERSONNEL] Optimistic update applied');
      }

      return { previousPersonnel };
    },
    onError: (err, personnelId, context) => {
      console.error('[DELETE PERSONNEL] onError - Mutation failed:', err);
      if (context?.previousPersonnel && activeTeam) {
        queryClient.setQueryData(personnelKeys.list(activeTeam.id), context.previousPersonnel);
        console.log('[DELETE PERSONNEL] Reverted optimistic update');
      }
      
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao excluir pessoal",
        variant: "destructive"
      });
    },
    onSuccess: (personnelId) => {
      console.log('[DELETE PERSONNEL] onSuccess - Personnel deleted successfully:', personnelId);
      toast({
        title: "Sucesso",
        description: "Pessoal excluído com sucesso!",
      });
    },
    onSettled: () => {
      console.log('[DELETE PERSONNEL] onSettled - Invalidating queries');
      queryClient.invalidateQueries({ queryKey: personnelKeys.list(activeTeam?.id) });
    },
  });
};