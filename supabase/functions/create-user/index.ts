import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'coordinator';
  teamId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the current user to verify admin permissions
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize client with auth header to check permissions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify current user is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin using secure function
    const { data: isAdmin, error: adminError } = await supabaseClient
      .rpc('is_admin');

    if (adminError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin privileges required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, password, name, role, teamId }: CreateUserRequest = await req.json();

    // Validate input
    if (!email || !password || !name || !role || !teamId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate password using our database function
    const { data: isValidPassword, error: passwordError } = await supabaseServiceRole
      .rpc('validate_password', { password });

    if (passwordError || !isValidPassword) {
      return new Response(JSON.stringify({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, and numbers' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating user:', { email, name, role, teamId });

    // Create user in auth
    const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('Failed to get user ID from auth response');
    }

    console.log('User created in auth:', userId);

    // Create user profile
    const { error: profileError } = await supabaseServiceRole
      .from('user_profiles')
      .insert({
        user_id: userId,
        email: email,
        name: name,
        role: role,
        is_approved: true
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Cleanup: delete auth user if profile creation fails
      await supabaseServiceRole.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: 'Failed to create user profile' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User profile created');

    // Add to team
    const { error: teamError } = await supabaseServiceRole
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: role,
        status: 'approved'
      });

    if (teamError) {
      console.error('Team member error:', teamError);
      // Cleanup: delete auth user and profile if team addition fails
      await supabaseServiceRole.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: 'Failed to add user to team' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User added to team');

    // Log the action for audit
    await supabaseServiceRole
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'USER_CREATED',
        table_name: 'user_profiles',
        record_id: userId,
        new_values: { email, name, role, teamId }
      });

    return new Response(JSON.stringify({ success: true, userId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);