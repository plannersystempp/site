
export interface Team {
  id: string;
  name: string;
  cnpj?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'admin' | 'coordinator' | 'financeiro';
  status: 'pending' | 'approved' | 'rejected';
  joined_at: string;
  joined_with_code?: string;
}

export interface TeamContextType {
  teams: Team[];
  activeTeam: Team | null;
  userRole: string | null;
  loading: boolean;
  setActiveTeam: (team: Team) => void;
  refreshTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Team>;
  inviteUserToTeam: (email: string, role: 'coordinator') => Promise<void>;
  removeUserFromTeam: (userId: string) => Promise<void>;
  updateMemberRole: (userId: string, newRole: 'admin' | 'coordinator' | 'financeiro') => Promise<void>;
  updateMemberStatus: (userId: string, newStatus: 'approved' | 'pending' | 'rejected') => Promise<void>;
  getTeamMembers: () => Promise<any[]>;
}
