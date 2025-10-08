
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { TeamContextType, Team } from './team/types';
import { useTeamOperations } from './team/useTeamOperations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    inviteUserToTeam,
    removeUserFromTeam: removeUserFromTeamOp,
    updateMemberRole: updateMemberRoleOp,
    updateMemberStatus: updateMemberStatusOp,
    getTeamMembers: getTeamMembersOp
  } = useTeamOperations();

  const refreshTeams = async () => {
    if (!user) return;

    // Super admins não precisam de equipe ativa
    if (user.role === 'superadmin') {
      setActiveTeam(null);
      setUserRole('superadmin');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use new approach - get teams that the user can access (via RLS)
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*');

      if (error) {
        console.error('Error fetching teams:', error);
        setActiveTeam(null);
        setUserRole(null);
      } else if (teams && teams.length > 0) {
        // In single-team mode, take the first (and should be only) team
        const team = teams[0];
        setActiveTeam(team);
        
        // Get user role in this team using the RPC function
        const { data: roleData } = await supabase
          .rpc('get_user_role_in_team', { check_team_id: team.id });
        
        setUserRole(roleData || 'user');
      } else {
        // No teams found - user might not be approved yet or no team access
        setActiveTeam(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error fetching user team:', error);
      setActiveTeam(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Para super admins, não precisam de equipe ativa
      if (user.role === 'superadmin') {
        setActiveTeam(null);
        setUserRole('superadmin');
        setLoading(false);
      } else {
        refreshTeams();
      }
    } else {
      setActiveTeam(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const getTeamMembers = async () => {
    if (!activeTeam) return [];
    return await getTeamMembersOp(activeTeam.id);
  };

  const removeUserFromTeam = async (userId: string) => {
    if (!activeTeam) {
      throw new Error('No active team');
    }
    return await removeUserFromTeamOp(userId, activeTeam.id);
  };

  const updateMemberRole = async (userId: string, newRole: 'admin' | 'coordinator' | 'financeiro') => {
    if (!activeTeam) {
      throw new Error('No active team');
    }
    return await updateMemberRoleOp(userId, activeTeam.id, newRole);
  };

  const updateMemberStatus = async (userId: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    if (!activeTeam) {
      throw new Error('No active team');
    }
    return await updateMemberStatusOp(userId, activeTeam.id, newStatus);
  };

  const value: TeamContextType = {
    teams: activeTeam ? [activeTeam] : [],
    activeTeam,
    userRole,
    loading,
    setActiveTeam: () => {}, // No longer needed since there's only one team
    refreshTeams,
    createTeam: async () => { throw new Error('Team creation not supported in single-team mode'); },
    inviteUserToTeam,
    removeUserFromTeam,
    updateMemberRole,
    updateMemberStatus,
    getTeamMembers,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
