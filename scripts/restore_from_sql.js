import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://epezxtdjfxnnfwutmisi.supabase.co'
const supabaseKey = 'sb_secret_pgRH_IQFNd1VNYvUxHmOwg_Tl7fUCt4'
const filePath = 'c:\\Users\\User\\Downloads\\backup_2025-12-23T11-35-36-598Z.sql\\backup_2025-12-23T11-35-36-598Z.sql'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

function splitSqlStatements(sql) {
  const statements = []
  let current = ''
  let inQuote = false
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    const nextChar = sql[i+1]
    
    if (inQuote) {
      if (char === "'" && nextChar === "'") {
        current += "''"
        i++ 
      } else if (char === "'") {
        inQuote = false
        current += char
      } else {
        current += char
      }
    } else {
      if (char === "'") {
        inQuote = true
        current += char
      } else if (char === ';') {
        statements.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
  }
  if (current.trim()) statements.push(current.trim())
  return statements
}

function parseValues(valuesStr) {
  const values = []
  let current = ''
  let inQuote = false
  let isQuotedString = false
  
  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i]
    const nextChar = valuesStr[i+1]
    
    if (inQuote) {
      if (char === "'" && nextChar === "'") {
        current += "'"
        i++ 
      } else if (char === "'") {
        inQuote = false
      } else {
        current += char
      }
    } else {
      if (char === "'") {
        inQuote = true
        isQuotedString = true
      } else if (char === ',') {
        values.push({ val: current.trim(), isString: isQuotedString })
        current = ''
        isQuotedString = false
      } else {
        current += char
      }
    }
  }
  values.push({ val: current.trim(), isString: isQuotedString })
  
  return values.map(v => {
    if (v.isString) return v.val
    if (v.val === 'NULL') return null
    if (v.val === 'TRUE') return true
    if (v.val === 'FALSE') return false
    if (!isNaN(Number(v.val)) && v.val !== '') return Number(v.val)
    return v.val
  })
}

async function restore() {
  console.log('Reading SQL file...')
  const sqlContent = fs.readFileSync(filePath, 'utf8')
  
  console.log('Splitting statements...')
  const statements = splitSqlStatements(sqlContent)
  console.log(`Found ${statements.length} statements.`)
  
  const batches = {} // { table: [rows] }
  
  for (const stmt of statements) {
    if (!stmt.toUpperCase().startsWith('INSERT INTO')) continue
    
    // Regex to extract table and columns and values section
    // INSERT INTO table ("c1", "c2") VALUES (...);
    // Note: table might be quoted or not.
    // simplified regex:
    const match = stmt.match(/INSERT INTO "?(\w+)"? \((.*?)\) VALUES \(([\s\S]*)\)$/i)
    if (!match) {
      console.warn('Could not parse statement:', stmt.substring(0, 50) + '...')
      continue
    }
    
    const table = match[1]
    const cols = match[2].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const valuesStr = match[3]
    
    const values = parseValues(valuesStr)
    
    if (cols.length !== values.length) {
      console.error(`Mismatch in ${table}: ${cols.length} cols vs ${values.length} vals`)
      continue
    }
    
    const row = {}
    cols.forEach((c, i) => row[c] = values[i])
    
    if (!batches[table]) batches[table] = []
    batches[table].push(row)
  }
  
  // Insert batches
  // Process tables in order of appearance in file to respect FKs?
  // The batches object keys order is insertion order in V8/Node usually, but let's be safe.
  // Actually, we should iterate the statements order again? 
  // No, grouping by table is more efficient for API, BUT dependency order matters.
  // If we have: Team1, Member1, Team2, Member2...
  // If we group: All Teams, All Members... That works nicely for dependencies (Teams before Members).
  // The file order is already grouped (based on Read output).
  // So iterating keys of `batches` should work if we rely on insertion order, or we can use the list of tables from the dump script if we knew it.
  // Based on `db-dump.mjs`, tables are processed in a specific order.
  // So executing bulk inserts per table in that order is safe.
  
  for (const table of Object.keys(batches)) {
    console.log(`Restoring ${table} (${batches[table].length} rows)...`)
    
    const rows = batches[table]
    const chunkSize = 100
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)
      const { error } = await supabase.from(table).upsert(chunk)
      if (error) {
        console.error(`Error inserting into ${table}:`, error)
      }
    }
  }
  
  console.log('Restoration complete.')
}

restore()
