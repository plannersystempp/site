import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'

const env = (k) => process.env[k] || ''
const req = (k) => { if (!process.env[k]) { console.error(JSON.stringify({ error:`Variável ausente: ${k}` })); process.exit(1) } }

req('DEST_SUPABASE_URL')
req('DEST_SERVICE_ROLE_KEY')

const dest = createClient(env('DEST_SUPABASE_URL'), env('DEST_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken: false, persistSession: false } })

async function findLatestBackupFiles() {
  const dir = path.join(process.cwd(), 'backups')
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = entries.filter(e => e.isFile() && /backup_.*\.(json|sql)\.gz$/i.test(e.name))
  if (files.length === 0) return null
  const stats = await Promise.all(files.map(async f => ({ name: f.name, stat: await fs.stat(path.join(dir, f.name)) })))
  stats.sort((a,b) => b.stat.mtimeMs - a.stat.mtimeMs)
  const latestBase = stats[0].name.replace(/\.(json|sql)\.gz$/i, '')
  const jsonName = `${latestBase}.json.gz`
  const sqlName = `${latestBase}.sql.gz`
  const jsonPath = path.join(dir, jsonName)
  const sqlPath = path.join(dir, sqlName)
  return { base: latestBase, jsonName, sqlName, jsonPath, sqlPath }
}

;(async () => {
  const latest = await findLatestBackupFiles()
  if (!latest) { console.error(JSON.stringify({ error:'Nenhum arquivo de backup encontrado em ./backups' })); process.exit(1) }

  const bucketName = 'backups'
  const ensureBucket = await dest.storage.getBucket(bucketName)
  if (!ensureBucket.data) {
    const created = await dest.storage.createBucket(bucketName, { public: false })
    if (created.error) { console.error(JSON.stringify({ error: created.error.message })); process.exit(1) }
  }

  const jsonBuf = await fs.readFile(latest.jsonPath)
  const sqlBuf = await fs.readFile(latest.sqlPath)

  const upJson = await dest.storage.from(bucketName).upload(latest.jsonName, jsonBuf, { contentType: 'application/gzip', upsert: true })
  if (upJson.error) { console.error(JSON.stringify({ error: upJson.error.message })); process.exit(1) }

  const upSql = await dest.storage.from(bucketName).upload(latest.sqlName, sqlBuf, { contentType: 'application/gzip', upsert: true })
  if (upSql.error) { console.error(JSON.stringify({ error: upSql.error.message })); process.exit(1) }

  const signedJson = await dest.storage.from(bucketName).createSignedUrl(latest.jsonName, 60 * 60)
  const signedSql = await dest.storage.from(bucketName).createSignedUrl(latest.sqlName, 60 * 60)

  console.log(JSON.stringify({
    success: true,
    bucket: bucketName,
    uploaded: [latest.jsonName, latest.sqlName],
    urls: {
      json: signedJson.data?.signedUrl || null,
      sql: signedSql.data?.signedUrl || null,
    }
  }))
  process.exit(0)
})()

