import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/contexts/EnhancedDataContext';

// Query keys for consistent caching
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (teamId?: string) => [...eventKeys.lists(), { teamId }] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

// Fetch events for a team
const fetchEvents = async (teamId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(event => ({
    id: event.id,
    team_id: event.team_id,
    name: event.name || '',
    description: event.description || '',
    start_date: event.start_date || '',
    end_date: event.end_date || '',
    status: event.status as Event['status'] || 'planejado',
    user_id: '',
    created_at: event.created_at || ''
  }));
};

// Hook to get events for the active team
export const useEventsQuery = () => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();

  return useQuery({
    queryKey: eventKeys.list(activeTeam?.id),
    queryFn: () => fetchEvents(activeTeam!.id),
    enabled: !!user && !!activeTeam?.id,
  });
};

// Hook to create a new event
export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: Omit<Event, 'id' | 'created_at' | 'team_id' | 'user_id'>) => {
      if (!activeTeam) throw new Error('No active team');

      const { data, error } = await supabase
        .from('events')
        .insert([{ ...event, team_id: activeTeam.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newEvent) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: eventKeys.list(activeTeam?.id) });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData<Event[]>(eventKeys.list(activeTeam?.id));

      // Optimistically update to the new value
      if (previousEvents && activeTeam) {
        const optimisticEvent: Event = {
          id: `temp-${Date.now()}`,
          team_id: activeTeam.id,
          user_id: '',
          created_at: new Date().toISOString(),
          ...newEvent,
        };

        queryClient.setQueryData<Event[]>(
          eventKeys.list(activeTeam.id),
          old => [optimisticEvent, ...(old || [])]
        );
      }

      return { previousEvents };
    },
    onError: (err, newEvent, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEvents && activeTeam) {
        queryClient.setQueryData(eventKeys.list(activeTeam.id), context.previousEvents);
      }
      
      toast({
        title: "Erro",
        description: "Falha ao criar evento",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: eventKeys.list(activeTeam?.id) });
    },
  });
};

// Hook to update an event
export const useUpdateEventMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: Event) => {
      const { data, error } = await supabase
        .from('events')
        .update({
          name: event.name,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          status: event.status,
        })
        .eq('id', event.id)
        .eq('team_id', activeTeam!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (updatedEvent) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.list(activeTeam?.id) });

      const previousEvents = queryClient.getQueryData<Event[]>(eventKeys.list(activeTeam?.id));

      // Optimistically update
      if (previousEvents && activeTeam) {
        queryClient.setQueryData<Event[]>(
          eventKeys.list(activeTeam.id),
          old => old?.map(event => event.id === updatedEvent.id ? updatedEvent : event) || []
        );
      }

      return { previousEvents };
    },
    onError: (err, updatedEvent, context) => {
      if (context?.previousEvents && activeTeam) {
        queryClient.setQueryData(eventKeys.list(activeTeam.id), context.previousEvents);
      }
      
      toast({
        title: "Erro",
        description: "Falha ao atualizar evento",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list(activeTeam?.id) });
    },
  });
};

// Hook to delete an event
export const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('team_id', activeTeam!.id);

      if (error) throw error;
      return eventId;
    },
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.list(activeTeam?.id) });

      const previousEvents = queryClient.getQueryData<Event[]>(eventKeys.list(activeTeam?.id));

      // Optimistically remove the event
      if (previousEvents && activeTeam) {
        queryClient.setQueryData<Event[]>(
          eventKeys.list(activeTeam.id),
          old => old?.filter(event => event.id !== eventId) || []
        );
      }

      return { previousEvents };
    },
    onError: (err, eventId, context) => {
      if (context?.previousEvents && activeTeam) {
        queryClient.setQueryData(eventKeys.list(activeTeam.id), context.previousEvents);
      }
      
      toast({
        title: "Erro",
        description: "Falha ao excluir evento",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list(activeTeam?.id) });
    },
  });
};