import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { encode as encodeHex } from 'https://deno.land/std@0.168.0/encoding/hex.ts'

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
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

    const serviceClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

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
      { tablename: 'personnel_functions' },
      { tablename: 'error_reports' },
      { tablename: 'notification_settings' }
    ]

    const backupData: Record<string, any> = {}
    const backupTimestamp = new Date().toISOString()
    const start = Date.now()

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
      durationMs: Date.now() - start
    }

    const completeBackup = {
      metadata: backupMetadata,
      data: backupData,
      version: '2.0',
      format: 'planner-system-backup'
    }

    const jsonString = JSON.stringify(completeBackup)
    const jsonBytes = new TextEncoder().encode(jsonString)
    const checksumBuf = await crypto.subtle.digest('SHA-256', jsonBytes)
    const checksum = new TextDecoder().decode(encodeHex(new Uint8Array(checksumBuf)))
    const gzipStream = new CompressionStream('gzip')
    const gzipped = await new Response(new Blob([jsonBytes]).stream().pipeThrough(gzipStream)).arrayBuffer()
    const gzBytes = new Uint8Array(gzipped)
    let sqlText = ''
    for (const t of tables) {
      const name = t.tablename
      const entry = backupData[name]
      if (entry && entry.data && Array.isArray(entry.data) && entry.data.length > 0) {
        for (const row of entry.data) {
          const cols = Object.keys(row)
          const vals = cols.map(c => toSqlValue(row[c]))
          sqlText += `INSERT INTO ${name} (${cols.map(c=>`"${c}"`).join(',')}) VALUES (${vals.join(',')});\n`
        }
      }
    }
    const sqlBytes = new TextEncoder().encode(sqlText)
    const sqlGzip = await new Response(new Blob([sqlBytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()
    const sqlGzBytes = new Uint8Array(sqlGzip)

    let fileKey: string | null = null
    let fileSize: number | null = null
    let signedUrl: string | null = null
    let sqlFileKey: string | null = null

    if (serviceClient) {
      const bucketName = 'backups'
      const ensureBucket = await serviceClient.storage.getBucket(bucketName)
      if (!ensureBucket.data) {
        await serviceClient.storage.createBucket(bucketName, { public: false })
      }
      const base = `backup_${backupTimestamp.replace(/[:.]/g,'-')}`
      const fileName = `${base}.json.gz`
      fileKey = fileName
      const upload = await serviceClient.storage.from(bucketName).upload(fileName, gzBytes, { contentType: 'application/gzip', upsert: true })
      if (!upload.error) {
        fileSize = gzBytes.byteLength
        const signed = await serviceClient.storage.from(bucketName).createSignedUrl(fileName, 60 * 60)
        signedUrl = signed.data?.signedUrl || null
      }
      const sqlName = `${base}.sql.gz`
      sqlFileKey = sqlName
      await serviceClient.storage.from(bucketName).upload(sqlName, sqlGzBytes, { contentType: 'application/gzip', upsert: true })
      const retentionSet = await serviceClient.from('backup_settings').select('*').limit(1).maybeSingle()
      const retentionDays = retentionSet.data?.retention_days ?? 30
      const maxBackups = retentionSet.data?.max_backups ?? 20
      const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString()
      await serviceClient.from('backup_logs').insert({
        status: 'success',
        file_key: fileKey,
        file_name: fileKey,
        file_size: fileSize,
        checksum,
        format: 'json',
        compressed: true,
        triggered_by: user.id,
        retention_expires_at: expiresAt,
        metadata: backupMetadata
      })
      await serviceClient.from('backup_logs').insert({
        status: 'success',
        file_key: sqlFileKey,
        file_name: sqlFileKey,
        file_size: sqlGzBytes.byteLength,
        checksum,
        format: 'sql',
        compressed: true,
        triggered_by: user.id,
        retention_expires_at: expiresAt,
        metadata: backupMetadata
      })
      const existing = await serviceClient.storage.from(bucketName).list('', { limit: 1000 })
      if (!existing.error && existing.data) {
        const sorted = [...existing.data].sort((a,b)=> a.name.localeCompare(b.name))
        if (sorted.length > maxBackups) {
          const toDelete = sorted.slice(0, sorted.length - maxBackups)
          for (const f of toDelete) {
            await serviceClient.storage.from(bucketName).remove([f.name])
          }
        }
      }
    }

    try {
      await supabaseClient.from('audit_logs').insert({
        user_id: user.id,
        action: 'database_backup',
        table_name: 'database',
        new_values: { ...backupMetadata, checksum },
        created_at: backupTimestamp,
      })
    } catch {}

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup: completeBackup,
        downloadUrl: signedUrl,
        fileKey,
        checksum,
        sqlFileKey
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

function toSqlValue(v: any): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL'
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  if (v instanceof Date) return `'${v.toISOString().replace("'", "''")}'`
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`
  const s = String(v)
  return `'${s.replace(/'/g, "''")}'`
}

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
