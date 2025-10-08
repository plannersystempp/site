
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TeamService } from './teamService';
import { supabase } from '@/integrations/supabase/client';

export const useTeamOperations = () => {
  const { toast } = useToast();

  const inviteUserToTeam = useCallback(async (email: string, role: 'coordinator') => {
    try {
      // TODO: Implementar lógica de convite real quando necessário
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso!",
      });
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Erro",
        description: "Falha ao convidar usuário",
        variant: "destructive"
      });
    }
  }, [toast]);

  const removeUserFromTeam = useCallback(async (userId: string, teamId: string) => {
    try {
      await TeamService.removeTeamMember(teamId, userId);
      
      toast({
        title: "Sucesso",
        description: "Usuário removido da equipe!",
      });
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover usuário",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const updateMemberRole = useCallback(async (userId: string, teamId: string, newRole: 'admin' | 'coordinator' | 'financeiro') => {
    try {
      await TeamService.updateTeamMemberRole(teamId, userId, newRole);
      
      toast({
        title: "Sucesso",
        description: "Papel do membro atualizado!",
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar papel do membro",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const updateMemberStatus = useCallback(async (userId: string, teamId: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status: newStatus })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;
      
      const statusLabels = {
        approved: 'aprovado',
        pending: 'pendente',
        rejected: 'desaprovado'
      };
      
      toast({
        title: "Sucesso",
        description: `Status do membro atualizado para ${statusLabels[newStatus]}`,
      });
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do membro",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const getTeamMembers = useCallback(async (teamId?: string): Promise<any[]> => {
    if (!teamId) return [];
    
    try {
      return await TeamService.getTeamMembers(teamId);
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  }, []);

  return {
    inviteUserToTeam,
    removeUserFromTeam,
    updateMemberRole,
    updateMemberStatus,
    getTeamMembers
  };
};
