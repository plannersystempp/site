import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!authHeader || !supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return new Response(JSON.stringify({ success: false, error: 'Ambiente inválido' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
    }
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } })
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user } } = await supabaseClient.auth.getUser()
    const { data: isSuperAdmin } = await supabaseClient.rpc('is_super_admin')
    if (!user || !isSuperAdmin) {
      return new Response(JSON.stringify({ success: false, error: 'Acesso negado' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 })
    }
    const { limit = 50 } = await req.json().catch(()=>({}))
    const { data, error } = await serviceClient.from('backup_logs').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
    }
    const bucketName = 'backups'
    const enriched = [] as any[]
    for (const item of data || []) {
      let signedUrl: string | null = null
      if (item.file_name) {
        const signed = await serviceClient.storage.from(bucketName).createSignedUrl(item.file_name, 60 * 60)
        signedUrl = signed.data?.signedUrl || null
      }
      enriched.push({ ...item, signedUrl })
    }
    return new Response(JSON.stringify({ success: true, backups: enriched }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message || 'Erro' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})
