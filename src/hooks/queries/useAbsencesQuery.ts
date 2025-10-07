
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Absence } from '@/contexts/data/types';
import type { CreateAbsenceData } from '@/contexts/data/formTypes';

export const absenceKeys = {
  all: ['absences'] as const,
  lists: () => [...absenceKeys.all, 'list'] as const,
  list: (eventId?: string) => [...absenceKeys.lists(), { eventId }] as const,
};

// Fetch absences for an event
const fetchEventAbsences = async (eventId: string, teamId: string): Promise<Absence[]> => {
  console.log('Fetching absences for event:', eventId, 'team:', teamId);
  
  const { data, error } = await supabase
    .from('absences')
    .select(`
      *,
      personnel_allocations!inner(event_id)
    `)
    .eq('team_id', teamId)
    .eq('personnel_allocations.event_id', eventId);

  if (error) {
    console.error('Error fetching absences:', error);
    throw error;
  }
  
  console.log('Fetched absences:', data);
  return data || [];
};

export const useAbsencesQuery = (eventId?: string) => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();

  return useQuery({
    queryKey: absenceKeys.list(eventId),
    queryFn: () => fetchEventAbsences(eventId!, activeTeam!.id),
    enabled: !!user && !!activeTeam?.id && !!eventId,
  });
};

export const useCreateAbsenceMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (absenceData: CreateAbsenceData) => {
      console.log('Creating absence with corrected structure:', absenceData);
      
      // Create absence record with the new database structure
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: absenceResult, error: absenceError } = await supabase
        .from('absences')
        .insert({
          assignment_id: absenceData.assignment_id,
          team_id: absenceData.team_id,
          work_date: absenceData.work_date,
          notes: absenceData.notes,
          logged_by_id: user?.id, // Explicitly set the logged_by_id
        })
        .select()
        .single();

      if (absenceError) {
        console.error('Error inserting absence:', absenceError);
        throw absenceError;
      }

      console.log('Absence created successfully:', absenceResult);

      // Remove any existing work records for this date to avoid conflicts
      try {
        const { data: allocation } = await supabase
          .from('personnel_allocations')
          .select('event_id, personnel_id')
          .eq('id', absenceData.assignment_id)
          .single();

        if (allocation) {
          const { error: workRecordError } = await supabase
            .from('work_records')
            .delete()
            .eq('event_id', allocation.event_id)
            .eq('employee_id', allocation.personnel_id)
            .eq('work_date', absenceData.work_date);

          if (workRecordError) {
            console.warn('Could not remove work records:', workRecordError);
          } else {
            console.log('Removed conflicting work records for absence');
          }
        }
      } catch (error) {
        console.warn('Error removing work records:', error);
      }

      return absenceResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: absenceKeys.all });
      toast({
        title: "Sucesso",
        description: "Falta registrada com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Error creating absence:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao registrar falta",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteAbsenceMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (absenceId: string) => {
      console.log('Deleting absence:', absenceId);
      
      const { error } = await supabase
        .from('absences')
        .delete()
        .eq('id', absenceId);

      if (error) {
        console.error('Error deleting absence:', error);
        throw error;
      }
      
      console.log('Absence deleted successfully');
      return absenceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: absenceKeys.all });
      toast({
        title: "Sucesso",
        description: "Falta removida com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting absence:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover falta",
        variant: "destructive"
      });
    },
  });
};
