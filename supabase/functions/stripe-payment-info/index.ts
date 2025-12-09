import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is superadmin
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only superadmins can access payment information' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing subscriptionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subscription details from database
    const { data: subscription, error: subError } = await supabaseClient
      .from('team_subscriptions')
      .select('gateway_customer_id, gateway_subscription_id, team_id')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('Subscription not found:', subError);
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no Stripe IDs, return empty data
    if (!subscription.gateway_customer_id || !subscription.gateway_subscription_id) {
      return new Response(
        JSON.stringify({
          hasStripeData: false,
          message: 'Esta assinatura não possui dados no Stripe',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Fetching Stripe data for subscription:', subscription.gateway_subscription_id);

    // Fetch Stripe subscription details
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.gateway_subscription_id
    );

    // Fetch payment method
    let paymentMethod: any = null;
    if (stripeSubscription.default_payment_method) {
      paymentMethod = await stripe.paymentMethods.retrieve(
        stripeSubscription.default_payment_method as string
      );
    }

    // Fetch latest invoices (last 5)
    const invoices = await stripe.invoices.list({
      customer: subscription.gateway_customer_id,
      limit: 5,
    });

    // Fetch upcoming invoice (next charge)
    let upcomingInvoice: any = null;
    try {
      upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: subscription.gateway_customer_id,
      });
    } catch (err) {
      console.log('No upcoming invoice:', err instanceof Error ? err.message : 'Unknown error');
    }

    // Format response
    const response = {
      hasStripeData: true,
      subscription: {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        current_period_start: stripeSubscription.current_period_start,
        current_period_end: stripeSubscription.current_period_end,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        canceled_at: stripeSubscription.canceled_at,
      },
      paymentMethod: paymentMethod
        ? {
            type: paymentMethod.type,
            card: paymentMethod.card
              ? {
                  brand: paymentMethod.card.brand,
                  last4: paymentMethod.card.last4,
                  exp_month: paymentMethod.card.exp_month,
                  exp_year: paymentMethod.card.exp_year,
                }
              : null,
          }
        : null,
      invoices: invoices.data.map((invoice: Stripe.Invoice) => ({
        id: invoice.id,
        amount_paid: invoice.amount_paid,
        amount_due: invoice.amount_due,
        status: invoice.status,
        created: invoice.created,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
      })),
      upcomingInvoice: upcomingInvoice
        ? {
            amount_due: upcomingInvoice.amount_due,
            period_end: upcomingInvoice.period_end,
          }
        : null,
      stripeCustomerUrl: `https://dashboard.stripe.com/customers/${subscription.gateway_customer_id}`,
      stripeSubscriptionUrl: `https://dashboard.stripe.com/subscriptions/${subscription.gateway_subscription_id}`,
    };

    console.log('Successfully fetched Stripe data');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Stripe payment info:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
