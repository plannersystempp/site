import pg from 'pg'
import fs from 'fs'
import path from 'path'

const { Client } = pg

const connectionString = 'postgres://postgres:sb_secret_pgRH_IQFNd1VNYvUxHmOwg_Tl7fUCt4@db.epezxtdjfxnnfwutmisi.supabase.co:5432/postgres'
const filePath = 'c:\\Users\\User\\Downloads\\backup_2025-12-23T11-35-36-598Z.sql\\backup_2025-12-23T11-35-36-598Z.sql'

async function restore() {
  console.log('Connecting to database...')
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected successfully.')

    console.log('Reading SQL file...')
    const sql = fs.readFileSync(filePath, 'utf8')

    console.log('Executing SQL...')
    // Execute the whole file as a single query block
    // Postgres allows multiple statements in one query string
    await client.query(sql)

    console.log('Restore completed successfully.')
  } catch (err) {
    console.error('Error during restoration:', err)
  } finally {
    await client.end()
  }
}

restore()
