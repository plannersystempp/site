import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
});

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'subscription_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔄 Sincronizando assinatura: ${subscriptionId}`);

    // Buscar assinatura no banco
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('team_subscriptions')
      .select('gateway_subscription_id, gateway_customer_id, team_id')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'Assinatura não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscription.gateway_subscription_id) {
      return new Response(
        JSON.stringify({ error: 'Assinatura não possui ID do Stripe' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.gateway_subscription_id
    );

    console.log(`✅ Dados do Stripe obtidos: ${stripeSubscription.status}`);

    // Mapear status
    const statusMap: Record<string, string> = {
      active: 'active',
      past_due: 'past_due',
      canceled: 'canceled',
      unpaid: 'past_due',
      trialing: 'trial',
      incomplete: 'past_due',
      incomplete_expired: 'trial_expired',
    };

    // Atualizar banco com dados do Stripe
    const { error: updateError } = await supabaseAdmin
      .from('team_subscriptions')
      .update({
        status: statusMap[stripeSubscription.status] || stripeSubscription.status,
        current_period_starts_at: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_ends_at: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        canceled_at: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (updateError) {
      throw updateError;
    }

    // Log de auditoria
    await supabaseAdmin.from('audit_logs').insert({
      team_id: subscription.team_id,
      action: 'STRIPE_MANUAL_SYNC',
      table_name: 'team_subscriptions',
      record_id: subscriptionId,
      new_values: {
        stripe_status: stripeSubscription.status,
        synced_at: new Date().toISOString(),
      },
    });

    console.log(`✅ Assinatura sincronizada com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscriptionId,
          stripe_status: stripeSubscription.status,
          mapped_status: statusMap[stripeSubscription.status] || stripeSubscription.status,
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Erro ao sincronizar:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
