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
    // Require authorization header - this function requires superadmin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authorization header required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Verify superadmin role
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting event status update job...')

    // Buscar eventos concluídos que precisam ter o status atualizado
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('id, status, end_date')
      .in('status', ['planejado', 'em_andamento'])
      .lt('end_date', new Date().toISOString().split('T')[0])

    if (fetchError) {
      console.error('Error fetching events:', fetchError)
      throw fetchError
    }

    console.log(`Found ${events?.length || 0} events to process`)

    let updatedCount = 0

    // Processar cada evento
    for (const event of events || []) {
      // Verificar se há alocações sem pagamento correspondente
      const { data: allocations, error: allocError } = await supabase
        .from('personnel_allocations')
        .select('personnel_id')
        .eq('event_id', event.id)

      if (allocError) {
        console.error(`Error fetching allocations for event ${event.id}:`, allocError)
        continue
      }

      let hasUnpaidAllocations = false

      // Verificar cada alocação
      for (const alloc of allocations || []) {
        const { data: payment, error: payError } = await supabase
          .from('payroll_closings')
          .select('id, total_amount_paid')
          .eq('event_id', event.id)
          .eq('personnel_id', alloc.personnel_id)
          .maybeSingle()

        if (payError) {
          console.error(`Error fetching payment:`, payError)
          continue
        }

        if (!payment || payment.total_amount_paid === 0) {
          hasUnpaidAllocations = true
          break
        }
      }

      // Determinar novo status
      const newStatus = hasUnpaidAllocations 
        ? 'concluido_pagamento_pendente' 
        : 'concluido'

      // Atualizar evento
      const { error: updateError } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', event.id)

      if (updateError) {
        console.error(`Error updating event ${event.id}:`, updateError)
      } else {
        updatedCount++
        console.log(`Event ${event.id} updated to ${newStatus}`)
      }
    }

    console.log(`Event status update completed: ${updatedCount} events updated`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Event statuses updated successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error: any) {
    console.error('Error in update-event-status function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})