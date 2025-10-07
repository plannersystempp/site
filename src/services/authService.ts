
import { supabase } from '@/integrations/supabase/client';

export const loginUser = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  } catch (error) {
    return { error };
  }
};

export const signupUser = async (email: string, password: string, name: string) => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    return { error };
  } catch (error) {
    return { error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    return { error };
  } catch (error) {
    return { error };
  }
};

export const logoutUser = async () => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
