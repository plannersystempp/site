import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { fetchPersonnelByRole } from '@/services/personnelService';
import { supabase } from '@/integrations/supabase/client';
import type { Personnel } from '@/contexts/EnhancedDataContext';

// Query keys for consistent caching
export const personnelKeys = {
  all: ['personnel'] as const,
  lists: () => [...personnelKeys.all, 'list'] as const,
  list: (teamId?: string) => [...personnelKeys.lists(), { teamId }] as const,
  details: () => [...personnelKeys.all, 'detail'] as const,
  detail: (id: string) => [...personnelKeys.details(), id] as const,
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
}

// Fetch personnel for a team with functions
const fetchPersonnelWithFunctions = async (teamId: string): Promise<Personnel[]> => {
  console.log('Fetching personnel with functions for team:', teamId);
  
  try {
    // Use the personnel service that handles role-based access
    const personnelData = await fetchPersonnelByRole(teamId);
    console.log('Personnel data fetched:', personnelData.length, 'records');
    
    // Fetch personnel functions associations
    const { data: personnelFunctionsData, error: personnelFunctionsError } = await supabase
      .from('personnel_functions')
      .select(`
        personnel_id,
        function_id,
        is_primary,
        functions:function_id (
          id,
          name,
          description
        )
      `)
      .eq('team_id', teamId);

    if (personnelFunctionsError) {
      console.error('Error fetching personnel functions:', personnelFunctionsError);
      // Continue without functions rather than failing completely
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

    console.log('Personnel with functions processed:', personnelWithFunctions.length, 'records');
    return personnelWithFunctions;
  } catch (error) {
    console.error('Error in fetchPersonnelWithFunctions:', error);
    throw error;
  }
};

// Hook to get personnel for the active team
export const usePersonnelQuery = () => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();

  return useQuery({
    queryKey: personnelKeys.list(activeTeam?.id),
    queryFn: () => fetchPersonnelWithFunctions(activeTeam!.id),
    enabled: !!user && !!activeTeam?.id,
  });
};

// Hook to create new personnel
export const useCreatePersonnelMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (personnelData: PersonnelFormData) => {
      if (!activeTeam) throw new Error('No active team');

      const { functionIds, pixKey, primaryFunctionId, ...sanitizedData } = personnelData;
      
      // Create personnel record
      const { data: personnelResult, error: personnelError } = await supabase
        .from('personnel')
        .insert([{ ...sanitizedData, team_id: activeTeam.id }])
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
    onSuccess: (data) => {
      // Invalidate and refetch personnel data
      queryClient.invalidateQueries({ queryKey: personnelKeys.list(activeTeam?.id) });
      
      toast({
        title: "Sucesso",
        description: "Pessoal adicionado com sucesso!",
      });
    },
    onError: (error) => {
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
      const { functionIds, pixKey, primaryFunctionId, ...sanitizedData } = personnelData;

      // Update personnel record
      const { data, error } = await supabase
        .from('personnel')
        .update(sanitizedData)
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
    onSuccess: () => {
      // Invalidate and refetch personnel data
      queryClient.invalidateQueries({ queryKey: personnelKeys.list(activeTeam?.id) });
      
      toast({
        title: "Sucesso",
        description: "Pessoal atualizado com sucesso!",
      });
    },
    onError: (error) => {
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
      const { error } = await supabase
        .from('personnel')
        .delete()
        .eq('id', personnelId)
        .eq('team_id', activeTeam!.id);

      if (error) throw error;
      return personnelId;
    },
    onMutate: async (personnelId) => {
      await queryClient.cancelQueries({ queryKey: personnelKeys.list(activeTeam?.id) });

      const previousPersonnel = queryClient.getQueryData<Personnel[]>(personnelKeys.list(activeTeam?.id));

      // Optimistically remove the personnel
      if (previousPersonnel && activeTeam) {
        queryClient.setQueryData<Personnel[]>(
          personnelKeys.list(activeTeam.id),
          old => old?.filter(person => person.id !== personnelId) || []
        );
      }

      return { previousPersonnel };
    },
    onError: (err, personnelId, context) => {
      if (context?.previousPersonnel && activeTeam) {
        queryClient.setQueryData(personnelKeys.list(activeTeam.id), context.previousPersonnel);
      }
      
      toast({
        title: "Erro",
        description: "Falha ao excluir pessoal",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Pessoal excluído com sucesso!",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: personnelKeys.list(activeTeam?.id) });
    },
  });
};