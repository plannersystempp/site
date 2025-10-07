
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TeamService } from './teamService';
import { Team, TeamMember } from './types';
import { useToast } from '@/hooks/use-toast';

export const useTeamManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [memberships, setMemberships] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshTeams = async () => {
    if (!user) {
      console.log('No user, clearing teams');
      setTeams([]);
      setMemberships([]);
      setActiveTeam(null);
      return;
    }

    try {
      setLoading(true);
      console.log('Refreshing teams for user:', user.id);

      // Buscar memberships e teams em paralelo, mas com tratamento de erro independente
      const [userMemberships, userTeams] = await Promise.allSettled([
        TeamService.getTeamMemberships(user.id),
        TeamService.getUserTeams(user.id)
      ]);

      // Processar memberships
      if (userMemberships.status === 'fulfilled') {
        console.log('Team memberships:', userMemberships.value);
        setMemberships(userMemberships.value);
      } else {
        console.error('Error fetching team memberships:', userMemberships.reason);
        setMemberships([]);
      }

      // Processar teams
      if (userTeams.status === 'fulfilled') {
        console.log('User teams:', userTeams.value);
        setTeams(userTeams.value);
        
        // Se não há equipe ativa e há equipes disponíveis, selecionar a primeira
        if (!activeTeam && userTeams.value.length > 0) {
          console.log('Setting active team to first team');
          setActiveTeam(userTeams.value[0]);
        }
      } else {
        console.error('Error fetching teams:', userTeams.reason);
        setTeams([]);
      }

    } catch (error) {
      console.error('Error in refreshTeams:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar equipes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string) => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Creating team:', name);
      
      const newTeam = await TeamService.createTeam(name, user.id);
      
      console.log('Team created successfully:', newTeam);
      
      toast({
        title: "Sucesso",
        description: `Equipe "${name}" criada com sucesso!`,
      });

      // Atualizar listas locais
      setTeams(prev => [...prev, newTeam]);
      
      // Se é a primeira equipe, torná-la ativa
      if (teams.length === 0) {
        setActiveTeam(newTeam);
      }

      // Refresh para garantir sincronização
      await refreshTeams();
      
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar equipe. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectTeam = (team: Team) => {
    console.log('Selecting team:', team.name);
    setActiveTeam(team);
  };

  const addMember = async (teamId: string, userId: string, role: string = 'coordinator') => {
    try {
      await TeamService.addTeamMember(teamId, userId, role);
      await refreshTeams();
      
      toast({
        title: "Sucesso",
        description: "Membro adicionado à equipe!",
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar membro",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    try {
      await TeamService.removeTeamMember(teamId, userId);
      await refreshTeams();
      
      toast({
        title: "Sucesso",
        description: "Membro removido da equipe!",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Erro", 
        description: "Falha ao remover membro",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMemberRole = async (teamId: string, userId: string, role: string) => {
    try {
      await TeamService.updateTeamMemberRole(teamId, userId, role);
      await refreshTeams();
      
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
  };

  const deleteTeam = async (teamId: string) => {
    try {
      await TeamService.deleteTeam(teamId);
      
      // Remover da lista local
      setTeams(prev => prev.filter(t => t.id !== teamId));
      
      // Se era a equipe ativa, limpar
      if (activeTeam?.id === teamId) {
        setActiveTeam(null);
      }
      
      await refreshTeams();
      
      toast({
        title: "Sucesso",
        description: "Equipe excluída!",
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir equipe",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Refresh teams quando o usuário muda
  useEffect(() => {
    if (user) {
      console.log('User changed, refreshing teams');
      refreshTeams();
    } else {
      console.log('No user, clearing team state');
      setTeams([]);
      setMemberships([]);
      setActiveTeam(null);
    }
  }, [user]);

  return {
    teams,
    activeTeam,
    memberships,
    loading,
    createTeam,
    selectTeam,
    addMember,
    removeMember,
    updateMemberRole,
    deleteTeam,
    refreshTeams
  };
};
