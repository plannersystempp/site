import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import {
  getCoordinatorPermissions,
  hasEventPermission,
  grantEventPermission,
  revokeEventPermission,
  getEventPermissions,
  type EventPermission
} from '@/services/eventPermissionsService';
import { useToast } from '@/hooks/use-toast';

export const eventPermissionKeys = {
  all: ['event-permissions'] as const,
  byCoordinator: (coordinatorId: string, teamId: string) => 
    [...eventPermissionKeys.all, 'coordinator', coordinatorId, teamId] as const,
  byEvent: (eventId: string, permissionType?: string) => 
    [...eventPermissionKeys.all, 'event', eventId, permissionType || 'all'] as const,
  eventManagement: (eventId: string, teamId: string) =>
    [...eventPermissionKeys.all, 'management', eventId, teamId] as const,
};

/**
 * Hook para buscar permissões do coordenador logado
 */
export const useMyEventPermissions = () => {
  const { user } = useAuth();
  const { activeTeam, userRole } = useTeam();

  return useQuery({
    queryKey: eventPermissionKeys.byCoordinator(user?.id || '', activeTeam?.id || ''),
    queryFn: () => getCoordinatorPermissions(user!.id, activeTeam!.id),
    enabled: !!user && !!activeTeam && userRole === 'coordinator',
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para verificar permissão específica
 */
export const useHasEventPermission = (
  eventId: string,
  permissionType: 'view' | 'edit' | 'allocations' | 'costs' | 'payroll' = 'view'
) => {
  const { user } = useAuth();
  const { userRole } = useTeam();

  return useQuery({
    queryKey: eventPermissionKeys.byEvent(eventId, permissionType),
    queryFn: () => hasEventPermission(user!.id, eventId, permissionType),
    enabled: !!user && !!eventId && userRole === 'coordinator',
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para conceder permissão (apenas admins)
 */
export const useGrantEventPermission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      coordinatorId,
      eventId,
      teamId,
      permissions
    }: {
      coordinatorId: string;
      eventId: string;
      teamId: string;
      permissions: Partial<EventPermission>;
    }) => grantEventPermission(coordinatorId, eventId, teamId, permissions),
    
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: eventPermissionKeys.byCoordinator(variables.coordinatorId, variables.teamId) 
      });
      queryClient.invalidateQueries({
        queryKey: eventPermissionKeys.eventManagement(variables.eventId, variables.teamId)
      });
      toast({
        title: "Permissão concedida",
        description: "As permissões foram atualizadas com sucesso."
      });
    },
    
    onError: (error) => {
      toast({
        title: "Erro ao conceder permissão",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

/**
 * Hook para revogar permissão (apenas admins)
 */
export const useRevokeEventPermission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeTeam } = useTeam();

  return useMutation({
    mutationFn: ({
      coordinatorId,
      eventId
    }: {
      coordinatorId: string;
      eventId: string;
    }) => revokeEventPermission(coordinatorId, eventId),
    
    onSuccess: (_, variables) => {
      if (activeTeam) {
        queryClient.invalidateQueries({ 
          queryKey: eventPermissionKeys.byCoordinator(variables.coordinatorId, activeTeam.id) 
        });
        queryClient.invalidateQueries({
          queryKey: eventPermissionKeys.eventManagement(variables.eventId, activeTeam.id)
        });
      }
      toast({
        title: "Permissão removida",
        description: "O acesso ao evento foi revogado."
      });
    },
    
    onError: (error) => {
      toast({
        title: "Erro ao revogar permissão",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

/**
 * Hook para buscar permissões de um evento (para gerenciamento)
 */
export const useEventPermissions = (eventId: string) => {
  const { activeTeam, userRole } = useTeam();

  return useQuery({
    queryKey: eventPermissionKeys.eventManagement(eventId, activeTeam?.id || ''),
    queryFn: () => getEventPermissions(eventId, activeTeam!.id),
    enabled: !!activeTeam && !!eventId && userRole === 'admin',
    staleTime: 1000 * 60 * 3,
  });
};
