import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'

const env = (k) => process.env[k] || ''
const req = (k) => { if (!process.env[k]) { console.error(JSON.stringify({ error:`Variável ausente: ${k}` })); process.exit(1) } }

req('SRC_SUPABASE_URL')
req('SRC_SERVICE_ROLE_KEY')

const src = createClient(env('SRC_SUPABASE_URL'), env('SRC_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken: false, persistSession: false } })

const defaultTables = [
  'teams','team_members','subscriptions','subscription_plans','events','personnel','event_personnel','payroll_closings','notifications','audit_logs','suppliers','supplier_items','supplier_ratings','freelancer_ratings','functions','work_records','absences','personnel_payments','event_divisions','personnel_functions','error_reports','notification_settings'
]

const tables = (process.env.TABLES ? process.env.TABLES.split(',').map(s=>s.trim()).filter(Boolean) : defaultTables)
const limit = Number(process.env.LIMIT_PER_TABLE || 1000000)
const chunk = Number(process.env.CHUNK_SIZE || 2000)

function toSqlValue(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL'
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  if (v instanceof Date) return `'${v.toISOString().replace("'", "''")}'`
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`
  const s = String(v)
  return `'${s.replace(/'/g, "''")}'`
}

async function getAllRows(name) {
  const { data, error } = await src.from(name).select('*').limit(limit)
  if (error) return { error: error.message, count: 0, data: [] }
  const rows = data || []
  return { data: rows, count: rows.length }
}

async function dumpAuthUsers() {
  let all = []
  let page = 1
  const perPage = Number(process.env.AUTH_USERS_PER_PAGE || 200)
  while (true) {
    const { data, error } = await src.auth.admin.listUsers({ page, perPage })
    if (error) return { error: error.message, count: 0, data: [] }
    const items = data?.users || []
    all = all.concat(items)
    if (items.length < perPage) break
    page += 1
  }
  return { data: all, count: all.length }
}

;(async () => {
  const backupTimestamp = new Date().toISOString()
  const start = Date.now()
  const backupData = {}

  const usersDump = await dumpAuthUsers()
  backupData['auth_users'] = usersDump.error ? { error: usersDump.error, count: 0, timestamp: backupTimestamp } : { data: usersDump.data, count: usersDump.count, timestamp: backupTimestamp }

  for (const t of tables) {
    const r = await getAllRows(t)
    if (r.error) console.error(JSON.stringify({ table:t, error:r.error }))
    backupData[t] = r.error ? { error: r.error, count: 0, timestamp: backupTimestamp } : { data: r.data, count: r.count, timestamp: backupTimestamp }
  }

  const successfulTables = Object.values(backupData).filter((v) => !v.error).length
  const failedTables = Object.values(backupData).filter((v) => v.error).length
  const backupMetadata = {
    timestamp: backupTimestamp,
    totalTables: Object.keys(backupData).length,
    successfulTables,
    failedTables,
    durationMs: Date.now() - start
  }

  const completeBackup = { metadata: backupMetadata, data: backupData, version: '2.0', format: 'planner-system-backup' }
  const jsonString = JSON.stringify(completeBackup)
  const jsonBuffer = Buffer.from(jsonString, 'utf-8')
  const jsonGz = zlib.gzipSync(jsonBuffer)

  let sqlText = ''
  for (const name of Object.keys(backupData)) {
    if (name === 'auth_users') continue
    const entry = backupData[name]
    if (entry && entry.data && Array.isArray(entry.data) && entry.data.length > 0) {
      for (const row of entry.data) {
        const cols = Object.keys(row)
        const vals = cols.map((c) => toSqlValue(row[c]))
        sqlText += `INSERT INTO ${name} (${cols.map((c)=>`"${c}"`).join(',')}) VALUES (${vals.join(',')});\n`
      }
    }
  }
  const sqlGz = zlib.gzipSync(Buffer.from(sqlText, 'utf-8'))

  const backupsDir = path.join(process.cwd(), 'backups')
  await fs.mkdir(backupsDir, { recursive: true })
  const base = `backup_${backupTimestamp.replace(/[:.]/g,'-')}`
  const jsonPath = path.join(backupsDir, `${base}.json.gz`)
  const sqlPath = path.join(backupsDir, `${base}.sql.gz`)
  await fs.writeFile(jsonPath, jsonGz)
  await fs.writeFile(sqlPath, sqlGz)

  console.log(JSON.stringify({ success:true, json: jsonPath, sql: sqlPath, metadata: backupMetadata }))
  process.exit(0)
})()
