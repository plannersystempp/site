import { supabase } from '@/integrations/supabase/client';

export interface EventPermission {
  id: string;
  coordinator_id: string;
  event_id: string;
  team_id: string;
  can_view_details: boolean;
  can_edit: boolean;
  can_manage_allocations: boolean;
  can_manage_costs: boolean;
  can_view_payroll: boolean;
  granted_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Busca as permissões de um coordenador para todos os eventos de sua equipe
 */
export const getCoordinatorPermissions = async (
  coordinatorId: string,
  teamId: string
): Promise<EventPermission[]> => {
  const { data, error } = await supabase
    .from('coordinator_event_permissions')
    .select('*')
    .eq('coordinator_id', coordinatorId)
    .eq('team_id', teamId);

  if (error) {
    console.error('[EventPermissions] Error fetching permissions:', error);
    throw error;
  }

  return data || [];
};

/**
 * Verifica se um coordenador tem permissão específica para um evento
 */
export const hasEventPermission = async (
  coordinatorId: string,
  eventId: string,
  permissionType: 'view' | 'edit' | 'allocations' | 'costs' | 'payroll' = 'view'
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('has_event_permission', {
    p_user_id: coordinatorId,
    p_event_id: eventId,
    p_permission_type: permissionType
  });

  if (error) {
    console.error('[EventPermissions] Error checking permission:', error);
    return false;
  }

  return data === true;
};

/**
 * Concede/atualiza permissões de um coordenador para um evento (apenas admins)
 */
export const grantEventPermission = async (
  coordinatorId: string,
  eventId: string,
  teamId: string,
  permissions: Partial<Omit<EventPermission, 'id' | 'coordinator_id' | 'event_id' | 'team_id' | 'created_at' | 'updated_at'>>
): Promise<EventPermission> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('coordinator_event_permissions')
    .upsert({
      coordinator_id: coordinatorId,
      event_id: eventId,
      team_id: teamId,
      granted_by: user?.id,
      ...permissions,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'coordinator_id,event_id'
    })
    .select()
    .single();

  if (error) {
    console.error('[EventPermissions] Error granting permission:', error);
    throw error;
  }

  return data;
};

/**
 * Remove permissão de um coordenador para um evento
 */
export const revokeEventPermission = async (
  coordinatorId: string,
  eventId: string
): Promise<void> => {
  const { error } = await supabase
    .from('coordinator_event_permissions')
    .delete()
    .eq('coordinator_id', coordinatorId)
    .eq('event_id', eventId);

  if (error) {
    console.error('[EventPermissions] Error revoking permission:', error);
    throw error;
  }
};

/**
 * Busca permissões de um evento específico (para gerenciamento)
 */
export const getEventPermissions = async (
  eventId: string,
  teamId: string
): Promise<EventPermission[]> => {
  const { data, error } = await supabase
    .from('coordinator_event_permissions')
    .select('*')
    .eq('event_id', eventId)
    .eq('team_id', teamId);

  if (error) {
    console.error('[EventPermissions] Error fetching event permissions:', error);
    throw error;
  }

  return data || [];
};
