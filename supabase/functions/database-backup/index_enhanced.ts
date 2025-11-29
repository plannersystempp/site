import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Configuração CORS aprimorada
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface BackupOptions {
  fullBackup?: boolean;
  tables?: string[];
  includeStorage?: boolean;
  compress?: boolean;
  validateData?: boolean;
}

interface BackupMetadata {
  timestamp: string;
  userId: string;
  userEmail: string;
  totalTables: number;
  successfulTables: number;
  failedTables: number;
  databaseSize: number;
  checksum?: string;
  duration: number;
  type: 'full' | 'incremental' | 'selective';
}

interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, any>;
  version: string;
  format: string;
  checksum?: string;
}

interface BackupResponse {
  success: boolean;
  backup?: BackupData;
  error?: string;
  warnings?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  const warnings: string[] = [];

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

    // Parse backup options from request body
    let backupOptions: BackupOptions = {
      fullBackup: true,
      validateData: true,
      compress: false,
      includeStorage: false
    };

    try {
      const body = await req.json();
      backupOptions = { ...backupOptions, ...body };
    } catch (e) {
      // Use default options if body parsing fails
      console.log('Using default backup options');
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

    // Get table list based on options
    const tables = backupOptions.tables || await getAllTables(supabaseClient);
    const backupData: Record<string, any> = {};
    const backupTimestamp = new Date().toISOString();
    let successfulTables = 0;
    let failedTables = 0;

    // Backup each table with advanced error handling and chunking
    for (const tableName of tables) {
      try {
        const tableData = await backupTableWithChunking(supabaseClient, tableName, backupOptions);
        if (tableData.error) {
          backupData[tableName] = tableData;
          failedTables++;
          warnings.push(`Tabela ${tableName}: ${tableData.error}`);
        } else {
          backupData[tableName] = tableData;
          successfulTables++;
        }
      } catch (error: any) {
        console.error(`Erro crítico ao processar tabela ${tableName}:`, error);
        backupData[tableName] = { 
          error: `Erro crítico: ${error.message}`,
          timestamp: backupTimestamp 
        };
        failedTables++;
        warnings.push(`Tabela ${tableName}: ${error.message}`);
      }
    }

    // Calculate checksum for data integrity
    let checksum: string | undefined;
    if (backupOptions.validateData) {
      try {
        checksum = await calculateChecksum(backupData);
      } catch (checksumError) {
        console.error('Erro ao calcular checksum:', checksumError);
        warnings.push('Não foi possível calcular checksum de validação');
      }
    }

    // Create backup metadata
    const backupMetadata: BackupMetadata = {
      timestamp: backupTimestamp,
      userId: user.id,
      userEmail: user.email!,
      totalTables: tables.length,
      successfulTables: successfulTables,
      failedTables: failedTables,
      databaseSize: JSON.stringify(backupData).length,
      duration: Date.now() - startTime,
      type: backupOptions.fullBackup ? 'full' : backupOptions.tables ? 'selective' : 'incremental',
      checksum
    };

    // Create the complete backup object
    const completeBackup: BackupData = {
      metadata: backupMetadata,
      data: backupData,
      version: '2.1',
      format: 'planner-system-enhanced-edge-backup',
      checksum
    };

    // Log the backup in audit_logs
    try {
      await supabaseClient.from('audit_logs').insert({
        user_id: user.id,
        action: 'database_backup_edge',
        table_name: 'database',
        new_values: {
          ...backupMetadata,
          warnings: warnings.length > 0 ? warnings : undefined
        },
        created_at: backupTimestamp,
      });
    } catch (logError) {
      console.error('Erro ao registrar log de auditoria:', logError);
      warnings.push('Não foi possível registrar log de auditoria');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup: completeBackup,
        warnings: warnings.length > 0 ? warnings : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Erro crítico no backup do banco de dados:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro crítico ao fazer backup do banco de dados' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
});

async function backupTableWithChunking(
  supabaseClient: any, 
  tableName: string, 
  options: BackupOptions
): Promise<any> {
  const maxRetries = 3;
  const chunkSize = 1000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Get total count first
      const { count, error: countError } = await supabaseClient
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Erro ao contar registros: ${countError.message}`);
      }

      const totalRecords = count || 0;
      const chunks = Math.ceil(totalRecords / chunkSize);
      const allData: any[] = [];

      // Fetch data in chunks
      for (let chunk = 0; chunk < chunks; chunk++) {
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .range(chunk * chunkSize, (chunk + 1) * chunkSize - 1);

        if (error) {
          throw new Error(`Erro ao buscar chunk ${chunk + 1}/${chunks}: ${error.message}`);
        }

        if (data) {
          allData.push(...data);
        }

        // Add small delay between chunks to prevent rate limiting
        if (chunk < chunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Validate data integrity if requested
      if (options.validateData && totalRecords !== allData.length) {
        throw new Error(`Inconsistência de dados: esperado ${totalRecords}, obtido ${allData.length}`);
      }

      return {
        data: allData,
        count: allData.length,
        totalRecords: totalRecords,
        chunks: chunks,
        timestamp: new Date().toISOString(),
        validated: options.validateData || false,
        retryAttempts: attempt > 1 ? attempt : undefined
      };

    } catch (error: any) {
      console.error(`Tentativa ${attempt} falhou para tabela ${tableName}:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        return {
          error: `Falha após ${maxRetries} tentativas: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
    }
  }
}

async function getAllTables(supabaseClient: any): Promise<string[]> {
  try {
    // Lista de tabelas principais do sistema, atualizada
    return [
      'users', 'teams', 'team_members', 'subscriptions', 'subscription_plans',
      'events', 'personnel', 'event_personnel', 'payroll_closings',
      'notifications', 'audit_logs', 'suppliers', 'supplier_items',
      'supplier_ratings', 'freelancer_ratings', 'functions', 'work_records',
      'absences', 'personnel_payments', 'event_divisions', 'personnel_functions',
      'error_reports', 'notification_settings', 'stripe_customers'
    ];
  } catch (error) {
    console.error('Erro ao obter lista de tabelas:', error);
    throw error;
  }
}

async function calculateChecksum(data: any): Promise<string> {
  try {
    const jsonString = JSON.stringify(data);
    
    // Simple hash implementation for Deno
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.error('Erro ao calcular checksum:', error);
    throw error;
  }
}