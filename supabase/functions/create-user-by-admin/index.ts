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
  team_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
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

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_admin');
    if (adminError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin privileges required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    
    const { email, password, name, role, team_id }: CreateUserRequest = requestBody;

    // Validate input
    if (!email || !password || !name || !role || !team_id) {
      console.log('Missing fields:', { email: !!email, password: !!password, name: !!name, role: !!role, team_id: !!team_id });
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        received: { email: !!email, password: !!password, name: !!name, role: !!role, team_id: !!team_id }
      }), {
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

    // Validate password manually (more reliable than RPC)
    if (password.length < 8) {
      return new Response(JSON.stringify({ 
        error: 'Password must be at least 8 characters long' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return new Response(JSON.stringify({ 
        error: 'Password must contain uppercase, lowercase, and numbers' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating user:', { email, name, role, team_id });

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      const message = (authError as any)?.message || 'Auth error';
      // If the user already exists in auth, return 409 with a friendly message
      if (typeof message === 'string' && message.toLowerCase().includes('already')) {
        return new Response(JSON.stringify({ 
          error: 'E-mail já cadastrado', 
          details: message 
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('Failed to get user ID from auth response');
    }

    console.log('User created in auth:', userId);

    // Create or update user profile (idempotent)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email: email,
        name: name,
        role: role,
        is_approved: true
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error('Profile error:', profileError);
      return new Response(JSON.stringify({ 
        error: 'Failed to create user profile', 
        details: profileError.message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User profile created');

    // Add to team (idempotent)
    const { error: teamError } = await supabaseAdmin
      .from('team_members')
      .upsert({
        team_id: team_id,
        user_id: userId,
        role: role,
        status: 'approved'
      }, { onConflict: 'team_id,user_id' });

    if (teamError) {
      console.error('Team member error:', teamError);
      return new Response(JSON.stringify({ 
        error: 'Failed to add user to team', 
        details: teamError.message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User added to team');

    // Log the action for audit
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'USER_CREATED',
        table_name: 'user_profiles',
        record_id: userId,
        new_values: { email, name, role, team_id }
      });

    return new Response(JSON.stringify({ message: 'Usuário criado com sucesso', userId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in create-user-by-admin function:', error);
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