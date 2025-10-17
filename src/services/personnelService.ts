import { supabase } from '@/integrations/supabase/client';
import type { Personnel } from '@/contexts/data/types';

// Type for redacted personnel data that coordinators see
export interface PersonnelRedacted {
  id: string;
  team_id: string;
  name: string;
  type: 'fixo' | 'freelancer';
  created_at: string;
  email_masked?: string;
  phone_masked?: string;
  cpf_masked?: string;
  cnpj_masked?: string;
  salary_range: string;
}

/**
 * Get user role in team to determine data access level
 */
export const getUserRoleInTeam = async (teamId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('get_user_role_in_team', { 
      check_team_id: teamId 
    });
    
    if (error) {
      console.error('Error getting user role:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Check if current user is super admin
 */
export const isSuperAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_super_admin');
    
    if (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
};

/**
 * Fetch personnel data based on user role
 * - Admins and super admins get full data
 * - Coordinators get redacted data
 */
export const fetchPersonnelByRole = async (teamId: string): Promise<Personnel[] | PersonnelRedacted[]> => {
  try {
    // Check if user is super admin first
    const isSuper = await isSuperAdmin();
    if (isSuper) {
      return fetchFullPersonnelData(teamId);
    }

    // Check user role in team
    const userRole = await getUserRoleInTeam(teamId);
    
    if (userRole === 'admin') {
      return fetchFullPersonnelData(teamId);
    } else {
      // Coordinators and other roles get redacted data
      return fetchRedactedPersonnelData(teamId);
    }
  } catch (error) {
    console.error('Error fetching personnel by role:', error);
    throw error;
  }
};

/**
 * Fetch full personnel data (for admins and super admins)
 */
const fetchFullPersonnelData = async (teamId: string): Promise<Personnel[]> => {
  console.log('Fetching full personnel data...');
  const { data, error } = await supabase
    .from('personnel')
    .select('*')
    .eq('team_id', teamId)
    .order('name');

  if (error) {
    console.error('Error fetching full personnel:', error);
    throw error;
  }

  console.log('Full personnel data fetched:', data?.length || 0);
  return (data || []).map(person => ({
    ...person,
    type: person.type as Personnel['type'] || 'freelancer',
    shirt_size: person.shirt_size as Personnel['shirt_size'] || undefined
  }));
};

/**
 * Fetch redacted personnel data (for coordinators)
 */
const fetchRedactedPersonnelData = async (teamId: string): Promise<PersonnelRedacted[]> => {
  console.log('Fetching redacted personnel data...');
  const { data, error } = await supabase.rpc('get_personnel_redacted');

  if (error) {
    console.error('Error fetching redacted personnel:', error);
    throw error;
  }

  // Filter by team_id since the function returns all accessible data
  const teamData = (data || []).filter(person => person.team_id === teamId);
  
  console.log('Redacted personnel data fetched:', teamData?.length || 0);
  return teamData.map(person => ({
    ...person,
    type: person.type as Personnel['type'] || 'freelancer'
  }));
};