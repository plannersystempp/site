import { createClient } from '@supabase/supabase-js'

const env = (k) => process.env[k] || ''
const req = (k) => { if (!process.env[k]) { console.error(`Variável ausente: ${k}`); process.exit(1) } }

req('SRC_SUPABASE_URL')
req('SRC_SERVICE_ROLE_KEY')
req('DEST_SUPABASE_URL')
req('DEST_SERVICE_ROLE_KEY')

const src = createClient(env('SRC_SUPABASE_URL'), env('SRC_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken: false, persistSession: false } })
const dest = createClient(env('DEST_SUPABASE_URL'), env('DEST_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken: false, persistSession: false } })

const defaultTables = [
  'users','teams','team_members','subscriptions','subscription_plans','events','personnel','event_personnel','payroll_closings','notifications','audit_logs','suppliers','supplier_items','supplier_ratings','freelancer_ratings','functions','work_records','absences','personnel_payments','event_divisions','personnel_functions','error_reports','notification_settings'
]

const tables = (process.env.TABLES ? process.env.TABLES.split(',').map(s=>s.trim()).filter(Boolean) : defaultTables)
const limit = Number(process.env.LIMIT_PER_TABLE || 100000)
const chunk = Number(process.env.CHUNK_SIZE || 1000)
const dry = ['1','true','TRUE'].includes(String(process.env.DRY_RUN || '0'))

async function copyTable(name) {
  const { data, error } = await src.from(name).select('*').limit(limit)
  if (error) { console.error(JSON.stringify({ table:name, error:error.message })); return { copied: 0 } }
  const rows = data || []
  if (dry) { console.log(JSON.stringify({ table:name, count: rows.length })); return { copied: 0 } }
  let copied = 0
  for (let i=0;i<rows.length;i+=chunk) {
    const batch = rows.slice(i, i+chunk)
    const first = batch[0]
    const hasId = first && Object.prototype.hasOwnProperty.call(first, 'id')
    const resp = hasId ? await dest.from(name).upsert(batch, { onConflict: 'id' }) : await dest.from(name).insert(batch)
    if (resp.error) console.error(JSON.stringify({ table:name, batch:i, error:resp.error.message }))
    else copied += batch.length
  }
  console.log(JSON.stringify({ table:name, copied }))
  return { copied }
}

;(async () => {
  let total = 0
  for (const t of tables) {
    const r = await copyTable(t)
    total += r.copied || 0
  }
  console.log(JSON.stringify({ success:true, totalCopied: total }))
  process.exit(0)
})()

