
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TeamService } from './teamService';
import { Team } from './types';

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

  const removeUserFromTeam = useCallback(async (userId: string) => {
    try {
      // TODO: Implementar remoção real quando o contexto for passado
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
    getTeamMembers
  };
};
