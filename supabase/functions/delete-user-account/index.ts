import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteUserAccountRequest {
  // Não precisamos de parâmetros adicionais, o usuário vem do JWT
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com as credenciais de service role para operações admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Obter o usuário a partir do JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar o token JWT para obter o usuário
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado ou token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Iniciando exclusão de conta para usuário: ${user.id}`);

    // Verificar se o usuário é o último membro da sua equipe
    const { data: userTeams, error: teamsError } = await supabaseAdmin
      .from('teams')
      .select('id, name')
      .eq('owner_id', user.id);

    if (teamsError) {
      throw new Error(`Erro ao verificar equipes: ${teamsError.message}`);
    }

    const { data: teamMemberships, error: membershipsError } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (membershipsError) {
      throw new Error(`Erro ao verificar membros: ${membershipsError.message}`);
    }

    // Usar transação para garantir consistência
    const { error: transactionError } = await supabaseAdmin.rpc('handle_user_deletion', {
      user_id_to_delete: user.id,
      owned_team_ids: userTeams?.map(t => t.id) || [],
      member_team_ids: teamMemberships?.map(m => m.team_id) || []
    });

    if (transactionError) {
      // Se a função RPC não existe, fazemos manualmente
      console.log('Função RPC não encontrada, executando exclusão manual');
      
      // Se o usuário possui equipes como owner
      if (userTeams && userTeams.length > 0) {
        for (const team of userTeams) {
          // Verificar se há outros membros na equipe
          const { data: otherMembers } = await supabaseAdmin
            .from('team_members')
            .select('id')
            .eq('team_id', team.id)
            .neq('user_id', user.id);

          if (!otherMembers || otherMembers.length === 0) {
            // Usuário é o último membro - deletar toda a equipe e dados
            console.log(`Deletando equipe ${team.id} e todos os dados associados`);
            
            // Deletar dados relacionados em ordem
            await supabaseAdmin.from('work_records').delete().eq('team_id', team.id);
            await supabaseAdmin.from('personnel_allocations').delete().eq('team_id', team.id);
            await supabaseAdmin.from('event_divisions').delete().eq('team_id', team.id);
            await supabaseAdmin.from('payroll_closings').delete().eq('team_id', team.id);
            await supabaseAdmin.from('freelancer_ratings').delete().eq('team_id', team.id);
            await supabaseAdmin.from('personnel').delete().eq('team_id', team.id);
            await supabaseAdmin.from('functions').delete().eq('team_id', team.id);
            await supabaseAdmin.from('events').delete().eq('team_id', team.id);
            await supabaseAdmin.from('team_members').delete().eq('team_id', team.id);
            await supabaseAdmin.from('teams').delete().eq('id', team.id);
          } else {
            // Há outros membros - transferir ownership para o primeiro membro ativo
            const { data: firstMember } = await supabaseAdmin
              .from('team_members')
              .select('user_id')
              .eq('team_id', team.id)
              .eq('status', 'approved')
              .neq('user_id', user.id)
              .limit(1)
              .single();

            if (firstMember) {
              await supabaseAdmin
                .from('teams')
                .update({ owner_id: firstMember.user_id })
                .eq('id', team.id);
              
              console.log(`Ownership da equipe ${team.id} transferido para ${firstMember.user_id}`);
            }
          }
        }
      }

      // Remover usuário de equipes onde é apenas membro
      if (teamMemberships && teamMemberships.length > 0) {
        await supabaseAdmin
          .from('team_members')
          .delete()
          .eq('user_id', user.id);
      }

      // Anonimizar dados criados pelo usuário (se necessário)
      // await supabaseAdmin.from('audit_logs').update({ user_id: null }).eq('user_id', user.id);
    }

    // Por fim, deletar a conta de autenticação
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Erro ao deletar usuário da autenticação:', deleteError);
      throw new Error(`Erro ao deletar conta: ${deleteError.message}`);
    }

    console.log(`Conta do usuário ${user.id} deletada com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Conta deletada com sucesso' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na exclusão de conta:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});