import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Configuração CORS aprimorada
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing environment variables' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Verify the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Check if user is superadmin via RPC
    try {
      const { data: isSuperAdmin, error: superAdminError } = await supabaseClient.rpc('is_super_admin')
      if (superAdminError || !isSuperAdmin) {
        return new Response(
          JSON.stringify({ success: false, error: 'Acesso negado: apenas superadmin pode fazer backup' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        )
      }
    } catch (rpcError) {
      console.error('Erro ao verificar superadmin:', rpcError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao verificar permissões' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Updated table list based on current schema
    const tables: { tablename: string }[] = [
      { tablename: 'users' },
      { tablename: 'teams' },
      { tablename: 'team_members' },
      { tablename: 'subscriptions' },
      { tablename: 'subscription_plans' },
      { tablename: 'events' },
      { tablename: 'personnel' },
      { tablename: 'event_personnel' },
      { tablename: 'payroll_closings' },
      { tablename: 'notifications' },
      { tablename: 'audit_logs' },
      { tablename: 'suppliers' },
      { tablename: 'supplier_items' },
      { tablename: 'supplier_ratings' },
      { tablename: 'freelancer_ratings' },
      { tablename: 'functions' },
      { tablename: 'work_records' },
      { tablename: 'absences' },
      { tablename: 'personnel_payments' },
      { tablename: 'event_divisions' },
      { tablename: 'personnel_functions' }
    ]

    const backupData: Record<string, any> = {}
    const backupTimestamp = new Date().toISOString()

    // Backup each table with error handling
    for (const table of tables) {
      try {
        const { data, error } = await supabaseClient
          .from(table.tablename)
          .select('*')
          .limit(10000) // Limit to prevent memory issues

        if (error) {
          console.error(`Erro ao fazer backup da tabela ${table.tablename}:`, error)
          backupData[table.tablename] = { 
            error: `Erro ao fazer backup: ${error.message}`,
            timestamp: backupTimestamp 
          }
        } else {
          backupData[table.tablename] = {
            data: data || [],
            count: data?.length || 0,
            timestamp: backupTimestamp
          }
        }
      } catch (error: any) {
        console.error(`Erro ao processar tabela ${table.tablename}:`, error)
        backupData[table.tablename] = { 
          error: `Erro ao processar tabela: ${error.message}`,
          timestamp: backupTimestamp 
        }
      }
    }

    // Create backup metadata
    const successfulTables = Object.values(backupData).filter((t: any) => !t.error).length
    const failedTables = Object.values(backupData).filter((t: any) => t.error).length

    const backupMetadata = {
      timestamp: backupTimestamp,
      userId: user.id,
      userEmail: user.email,
      totalTables: Object.keys(backupData).length,
      successfulTables: successfulTables,
      failedTables: failedTables,
      databaseSize: JSON.stringify(backupData).length,
    }

    // Create the complete backup object
    const completeBackup = {
      metadata: backupMetadata,
      data: backupData,
      version: '1.1',
      format: 'planner-system-backup'
    }

    // Log the backup in audit_logs
    try {
      await supabaseClient.from('audit_logs').insert({
        user_id: user.id,
        action: 'database_backup',
        table_name: 'database',
        new_values: backupMetadata,
        created_at: backupTimestamp,
      })
    } catch (logError) {
      console.error('Erro ao registrar log de auditoria:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup: completeBackup,
        downloadUrl: null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Erro no backup do banco de dados:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro ao fazer backup do banco de dados' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})