import { supabase } from '@/integrations/supabase/client';

export const deleteUserAccount = async (password: string) => {
  try {
    // Chama a edge function para deletar a conta, passando a senha
    const { data, error } = await supabase.functions.invoke('delete-user-account', {
      body: { password },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return { success: false, error: error.message };
  }
};