// FASE 5: Edge Function para Limpeza Automática de Logs Antigos
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting cleanup of old audit logs...');

    // Calcular data de 90 dias atrás
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Ações críticas que NÃO devem ser deletadas
    const criticalActions = [
      'DELETE',
      'USER_ROLE_CHANGE',
      'TEAM_ACCESS_REQUEST',
      'USER_APPROVAL_CHANGE',
      'SUBSCRIPTION_CREATED',
      'SUBSCRIPTION_CHANGE',
    ];

    // Deletar logs antigos, exceto ações críticas
    const { data, error, count } = await supabaseClient
      .from('audit_logs')
      .delete({ count: 'exact' })
      .lt('created_at', ninetyDaysAgo.toISOString())
      .not('action', 'in', `(${criticalActions.map(a => `"${a}"`).join(',')})`);

    if (error) {
      console.error('Error cleaning up logs:', error);
      throw error;
    }

    console.log(`Successfully deleted ${count || 0} old audit logs`);

    // Registrar a limpeza
    await supabaseClient.from('audit_logs').insert({
      action: 'SYSTEM_CLEANUP',
      table_name: 'audit_logs',
      new_values: {
        deleted_count: count || 0,
        cutoff_date: ninetyDaysAgo.toISOString(),
        executed_at: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        deleted_count: count || 0,
        cutoff_date: ninetyDaysAgo.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in cleanup-old-logs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/* 
 * Para agendar esta função via Cron (semanal, domingos às 2h):
 * 
 * SELECT cron.schedule(
 *   'cleanup-old-audit-logs',
 *   '0 2 * * 0',
 *   $$
 *   SELECT net.http_post(
 *     url:='https://atogozlqfwxztjyycjoy.supabase.co/functions/v1/cleanup-old-logs',
 *     headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
 *   ) as request_id;
 *   $$
 * );
 */
