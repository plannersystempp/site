import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteTeamRequest {
  teamId: string;
  force?: boolean; // Se true, deleta mesmo com múltiplos membros
  deleteOrphanUsers?: boolean; // Se true, deleta usuários que ficarem sem equipe
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Verificar role de superadmin
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data: isSuperAdmin, error: roleError } = await supabaseAuth.rpc('is_super_admin');
    if (roleError || !isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Superadmin access required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }

    // Parse request
    const { teamId, force, deleteOrphanUsers } = await req.json() as DeleteTeamRequest;
    
    if (!teamId) {
      return new Response(
        JSON.stringify({ error: 'teamId is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Obter informações da equipe
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('id, name, cnpj, owner_id')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return new Response(
        JSON.stringify({ error: 'Team not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Contar membros
    const { data: members, error: membersError } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);

    if (membersError) {
      throw new Error(`Error fetching members: ${membersError.message}`);
    }

    const memberCount = members?.length || 0;

    // Validação: se tem mais de 1 membro e não é force, bloquear
    if (memberCount > 1 && !force) {
      return new Response(
        JSON.stringify({ 
          error: `A equipe tem ${memberCount} membros. Use force=true para confirmar a exclusão.`,
          memberCount 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Deleting team ${team.name} (${teamId}) with ${memberCount} members`);

    // Obter estatísticas antes de deletar
    const { data: preview } = await supabaseAdmin.rpc('preview_team_deletion', { p_team_id: teamId });

    // Deletar dados em ordem (CASCADE)
    const deletionOrder = [
      { table: 'work_records', column: 'team_id' },
      { table: 'personnel_allocations', column: 'team_id' },
      { table: 'event_divisions', column: 'team_id' },
      { table: 'payroll_closings', column: 'team_id' },
      { table: 'payroll_sheets', column: 'team_id' },
      { table: 'payroll_payments', column: 'team_id' },
      { table: 'event_payroll', column: 'team_id' },
      { table: 'freelancer_ratings', column: 'team_id' },
      { table: 'personnel_functions', column: 'team_id' },
      { table: 'personnel_documents', column: 'team_id' },
      { table: 'personnel', column: 'team_id' },
      { table: 'functions', column: 'team_id' },
      { table: 'event_supplier_costs', column: 'team_id' },
      { table: 'events', column: 'team_id' },
      { table: 'absences', column: 'team_id' },
      { table: 'audit_logs', column: 'team_id' },
      { table: 'team_members', column: 'team_id' },
    ];

    for (const { table, column } of deletionOrder) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq(column, teamId);
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error);
      } else {
        console.log(`Deleted records from ${table}`);
      }
    }

    // Deletar a equipe
    const { error: teamDeleteError } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (teamDeleteError) {
      throw new Error(`Error deleting team: ${teamDeleteError.message}`);
    }

    // Se solicitado, deletar usuários órfãos resultantes
    const orphanedUsers = [];
    if (deleteOrphanUsers && members) {
      for (const member of members) {
        // Verificar se o usuário ficou sem equipe
        const { data: remainingTeams } = await supabaseAdmin
          .from('team_members')
          .select('id')
          .eq('user_id', member.user_id);

        if (!remainingTeams || remainingTeams.length === 0) {
          // Deletar usuário órfão
          await supabaseAdmin.from('user_profiles').delete().eq('user_id', member.user_id);
          await supabaseAdmin.auth.admin.deleteUser(member.user_id);
          orphanedUsers.push(member.user_id);
          console.log(`Deleted orphan user: ${member.user_id}`);
        }
      }
    }

    // Obter usuário que executou a ação
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);

    // Registrar exclusão nos logs
    await supabaseAdmin.from('deletion_logs').insert({
      deleted_by: user?.id,
      deletion_type: 'team_by_admin',
      deleted_entity_id: teamId,
      deleted_entity_type: 'team',
      deleted_entity_name: team.name,
      reason: `Exclusão de equipe pelo SuperAdmin${force ? ' (forçada)' : ''}`,
      data_summary: {
        ...preview,
        member_count: memberCount,
        orphaned_users_deleted: orphanedUsers.length
      }
    });

    console.log(`Team ${team.name} deleted successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Equipe "${team.name}" deletada com sucesso`,
        deletedTeamId: teamId,
        membersAffected: memberCount,
        orphanedUsersDeleted: orphanedUsers.length,
        dataSummary: preview
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in delete-team-by-superadmin:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
