
import type { User } from '@supabase/supabase-js';
import type { AppUser } from '@/types/auth';

// Esta função não é mais necessária pois a lógica foi movida para AuthContext
// Mantendo apenas para compatibilidade, mas não deve ser usada
export const createAppUser = async (authUser: User): Promise<AppUser> => {
  console.warn('createAppUser is deprecated - user profile is now handled in AuthContext');
  
  return {
    id: authUser.id,
    email: authUser.email || '',
    role: 'user',
    name: authUser.user_metadata?.name || authUser.email || 'Usuário',
    isApproved: false
  };
};
