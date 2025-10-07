
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamMember } from './types';

export class TeamService {
  static async getTeamMemberships(userId: string): Promise<TeamMember[]> {
    try {
      console.log('Fetching team memberships for user:', userId);
      
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error in getTeamMemberships:', error);
        throw error;
      }

      console.log('Team memberships fetched successfully:', data?.length || 0);
      return (data || []) as TeamMember[];
    } catch (error) {
      console.error('Exception in getTeamMemberships:', error);
      return [];
    }
  }

  static async getUserTeams(userId: string): Promise<Team[]> {
    try {
      console.log('Fetching teams for user:', userId);

      // Buscar equipes onde o usuário é dono OU membro
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      console.log('Teams fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Exception in getUserTeams:', error);
      return [];
    }
  }

  static async createTeam(name: string, userId: string): Promise<Team> {
    try {
      console.log('Creating team:', name, 'for user:', userId);

      // Gerar código de convite único
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Primeiro criar a equipe
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([{
          name,
          owner_id: userId,
          invite_code: inviteCode
        }])
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        throw teamError;
      }

      console.log('Team created successfully:', team);

      // Depois adicionar o criador como admin da equipe
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          user_id: userId,
          role: 'admin',
          status: 'approved'
        }]);

      if (memberError) {
        console.error('Error adding team member:', memberError);
        // Não falhar a criação da equipe se não conseguir adicionar o membro
        console.log('Team created but failed to add member automatically');
      } else {
        console.log('Team member added successfully');
      }

      return team;
    } catch (error) {
      console.error('Exception creating team:', error);
      throw error;
    }
  }

  static async addTeamMember(teamId: string, userId: string, role: string = 'coordinator'): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: userId,
          role
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  static async updateTeamMemberRole(teamId: string, userId: string, role: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating team member role:', error);
      throw error;
    }
  }

  static async deleteTeam(teamId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }

  static async getTeamMembers(teamId: string): Promise<any[]> {
    try {
      console.log('Fetching team members for team:', teamId);
      
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          team_id,
          role,
          status,
          joined_at,
          user_profiles!inner (
            name,
            email
          )
        `)
        .eq('team_id', teamId);

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      console.log('Team members fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Exception in getTeamMembers:', error);
      return [];
    }
  }
}
