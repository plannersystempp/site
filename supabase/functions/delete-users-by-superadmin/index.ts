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

    const deletedUsers = [];
    const errors = [];

    // Delete each user
    for (const userId of userIds) {
      try {
        console.log(`Deleting user: ${userId}`);

        // Delete from team_members first (foreign key constraint)
        await supabaseAdmin
          .from('team_members')
          .delete()
          .eq('user_id', userId);

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