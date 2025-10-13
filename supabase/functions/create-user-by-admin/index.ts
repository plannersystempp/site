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

    console.log('Checking if user profile already exists:', { email });

    // First check if user profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, role, is_approved')
      .eq('email', email)
      .maybeSingle();
    
    let userId: string;
    let isNewUser = false;
    let isOrphanUser = false;

    if (existingProfile) {
      // User profile exists - just update if needed
      userId = existingProfile.user_id;
      console.log('User profile already exists, will update if needed:', userId);
      isNewUser = false;
    } else {
      // Profile doesn't exist - try to create user in auth
      console.log('Creating new user in auth:', { email, name, role, team_id });
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: name
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        const message = (authError as any)?.message || 'Auth error';
        
        // Check if user exists in auth but is orphan (no profile)
        if (typeof message === 'string' && message.toLowerCase().includes('already')) {
          console.log('User exists in auth but no profile - finding orphan user');
          
          // List users to find the one with this email (workaround for missing getUserByEmail)
          const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000 // Should be enough to find the user
          });
          
          if (listError) {
            console.error('Failed to list users:', listError);
            return new Response(JSON.stringify({ 
              error: 'E-mail já cadastrado mas falha ao recuperar dados do usuário', 
              details: listError.message 
            }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          const orphanUser = userList.users.find(u => u.email === email);
          
          if (!orphanUser) {
            return new Response(JSON.stringify({ 
              error: 'E-mail já cadastrado mas usuário não encontrado no sistema', 
              details: 'Inconsistência no banco de dados' 
            }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          userId = orphanUser.id;
          console.log('Orphan user found, completing profile:', userId);
          isNewUser = false;
          isOrphanUser = true;
        } else {
          return new Response(JSON.stringify({ 
            error: 'Falha ao criar usuário no sistema de autenticação', 
            details: message 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        userId = authData.user?.id;
        if (!userId) {
          throw new Error('Failed to get user ID from auth response');
        }

        console.log('New user created in auth:', userId);
        isNewUser = true;
      }
    }

    // Create or update user profile (idempotent)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email: email,
        name: name,
        role: role,
        is_approved: true
      }, { onConflict: 'user_id', returning: 'minimal' });

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

    // Add to team with retry logic (idempotent)
    let teamMemberAdded = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!teamMemberAdded && retryCount < maxRetries) {
      const { data: teamMemberData, error: teamError } = await supabaseAdmin
        .from('team_members')
        .upsert({
          team_id: team_id,
          user_id: userId,
          role: role,
          status: 'approved'
        }, { onConflict: 'team_id,user_id', ignoreDuplicates: false, returning: 'minimal' });

      if (teamError) {
        console.error(`Team member error (attempt ${retryCount + 1}):`, teamError);
        retryCount++;
        if (retryCount >= maxRetries) {
          return new Response(JSON.stringify({ 
            error: 'Failed to add user to team after retries', 
            details: teamError.message 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      teamMemberAdded = true;
      console.log('User added to team:', teamMemberData);
    }

    // Verify team membership was created
    const { data: verifyMember, error: verifyError } = await supabaseAdmin
      .from('team_members')
      .select('user_id, team_id, role, status')
      .eq('team_id', team_id)
      .eq('user_id', userId)
      .single();

    if (verifyError || !verifyMember) {
      console.error('Verification failed - user not in team_members:', verifyError);
      return new Response(JSON.stringify({ 
        error: 'User created but failed to add to team', 
        details: 'Verification failed after team member creation',
        userId: userId
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Team membership verified:', verifyMember);

    // Log the action for audit
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: user.id,
        team_id: team_id,
        action: isNewUser ? 'USER_CREATED' : (isOrphanUser ? 'ORPHAN_USER_COMPLETED' : 'USER_UPDATED'),
        table_name: 'user_profiles',
        record_id: userId,
        new_values: { email, name, role, team_id, isNewUser, isOrphanUser }
      });

    const successMessage = isNewUser 
      ? 'Usuário criado com sucesso' 
      : (isOrphanUser 
        ? 'Usuário existente completado com sucesso' 
        : 'Perfil atualizado com sucesso');

    return new Response(JSON.stringify({ 
      message: successMessage, 
      userId,
      isNewUser,
      isOrphanUser 
    }), {
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
