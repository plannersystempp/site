import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authorization header first
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

    // Verify superadmin role before processing request
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

    // Parse request body after authorization
    const { userIds } = await req.json();
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'userIds array is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Create Supabase admin client for deletions
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

    const deletedUsers: any[] = [];
    const errors: any[] = [];

    // Delete each user
    for (const userId of userIds) {
      try {
        console.log(`Deleting user: ${userId}`);

        // Check if user owns any teams
        const { data: ownedTeams, error: teamsError } = await supabaseAdmin
          .from('teams')
          .select('id, name')
          .eq('owner_id', userId);

        if (teamsError) {
          console.error(`Error checking teams for user ${userId}:`, teamsError);
          errors.push({ userId, error: `Erro ao verificar equipes: ${teamsError.message}` });
          continue;
        }

        if (ownedTeams && ownedTeams.length > 0) {
          const teamNames = ownedTeams.map(t => t.name).join(', ');
          console.error(`User ${userId} owns teams: ${teamNames}`);
          errors.push({ 
            userId, 
            error: `Usuário é proprietário da(s) equipe(s): ${teamNames}. Transfira a propriedade antes de deletar.`,
            ownedTeams: ownedTeams 
          });
          continue;
        }

        // Delete from pending_user_setups if exists
        await supabaseAdmin
          .from('pending_user_setups')
          .delete()
          .eq('user_id', userId);

        // Delete from team_members (foreign key constraint)
        await supabaseAdmin
          .from('team_members')
          .delete()
          .eq('user_id', userId);

        // Get user info for logging BEFORE deleting from user_profiles
        const { data: userProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('email, name')
          .eq('user_id', userId)
          .single();

        // Delete from user_profiles
        await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('user_id', userId);

        // Delete from auth.users using admin API
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (authError) {
          console.error(`Error deleting user ${userId} from auth:`, authError);
          errors.push({ userId, error: authError.message });
        } else {
          // Log deletion
          const token = authHeader.replace('Bearer ', '');
          const { data: { user: adminUser } } = await supabaseAdmin.auth.getUser(token);
          
          await supabaseAdmin.from('deletion_logs').insert({
            deleted_by: adminUser?.id,
            deletion_type: 'user_by_admin',
            deleted_entity_id: userId,
            deleted_entity_type: 'user',
            deleted_entity_name: userProfile?.email || userId,
            reason: 'Exclusão de usuário pelo SuperAdmin',
            data_summary: {
              user_name: userProfile?.name,
              user_email: userProfile?.email
            }
          });

          deletedUsers.push(userId);
          console.log(`Successfully deleted user: ${userId}`);
        }

      } catch (error: any) {
        console.error(`Error deleting user ${userId}:`, error);
        errors.push({ userId, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        deletedUsers, 
        errors,
        message: `${deletedUsers.length} usuários deletados com sucesso${errors.length > 0 ? `, ${errors.length} erros` : ''}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in delete-users-by-superadmin:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
