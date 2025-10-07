import { supabase } from '@/integrations/supabase/client';

export const deleteUserAccount = async (password: string) => {
  try {
    // Verifica a senha do usuário re-autenticando
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.email) {
      throw new Error('Usuário não encontrado');
    }

    // Re-autentica para verificar a senha
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.user.email,
      password: password
    });

    if (authError) {
      throw new Error('Senha incorreta');
    }

    // Chama a edge function para deletar a conta
    const { data, error } = await supabase.functions.invoke('delete-user-account', {
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