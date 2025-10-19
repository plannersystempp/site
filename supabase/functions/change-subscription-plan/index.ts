import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get JWT token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify user is superadmin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'superadmin') {
      console.error('❌ User is not superadmin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Only superadmins can change subscription plans' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Superadmin verified:', user.id);

    // Get request body
    const { subscriptionId, newPlanId } = await req.json();

    if (!subscriptionId || !newPlanId) {
      throw new Error('Missing required parameters: subscriptionId and newPlanId');
    }

    console.log('📝 Changing plan:', { subscriptionId, newPlanId });

    // Get current subscription
    const { data: currentSub, error: subError } = await supabase
      .from('team_subscriptions')
      .select(`
        *,
        teams(name),
        subscription_plans(display_name)
      `)
      .eq('id', subscriptionId)
      .single();

    if (subError || !currentSub) {
      throw new Error('Subscription not found');
    }

    const oldPlanName = (currentSub.subscription_plans as any)?.display_name;
    const teamName = (currentSub.teams as any)?.name;

    // Get new plan details
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('display_name, name')
      .eq('id', newPlanId)
      .single();

    if (planError || !newPlan) {
      throw new Error('New plan not found');
    }

    // Update subscription
    const now = new Date();
    const newPeriodEnd = new Date(now);
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1); // Extend by 1 month

    const updateData: any = {
      plan_id: newPlanId,
      current_period_starts_at: now.toISOString(),
      current_period_ends_at: newPeriodEnd.toISOString(),
      updated_at: now.toISOString()
    };

    // If changing to/from trial, update status
    if (newPlan.name === 'trial') {
      updateData.status = 'trial';
      updateData.trial_ends_at = newPeriodEnd.toISOString();
    } else if (currentSub.status === 'trial') {
      updateData.status = 'active';
      updateData.trial_ends_at = null;
    }

    const { error: updateError } = await supabase
      .from('team_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    if (updateError) {
      console.error('❌ Error updating subscription:', updateError);
      throw new Error('Failed to update subscription');
    }

    console.log('✅ Subscription updated successfully');

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        team_id: currentSub.team_id,
        action: 'SUBSCRIPTION_PLAN_CHANGED',
        table_name: 'team_subscriptions',
        record_id: subscriptionId,
        old_values: {
          plan_id: currentSub.plan_id,
          plan_name: oldPlanName
        },
        new_values: {
          plan_id: newPlanId,
          plan_name: newPlan.display_name
        }
      });

    console.log('✅ Audit log created');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Plano alterado de "${oldPlanName}" para "${newPlan.display_name}" para a equipe "${teamName}"`,
        subscription: {
          id: subscriptionId,
          old_plan: oldPlanName,
          new_plan: newPlan.display_name,
          period_ends_at: newPeriodEnd.toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Error in change-subscription-plan:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
