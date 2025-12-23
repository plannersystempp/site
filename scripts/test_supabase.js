import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://epezxtdjfxnnfwutmisi.supabase.co'
const supabaseKey = 'sb_secret_pgRH_IQFNd1VNYvUxHmOwg_Tl7fUCt4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  // Try to select from a table, e.g. 'teams' since it's in the dump
  const { data, error } = await supabase.from('teams').select('count', { count: 'exact', head: true })
  
  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('Connection successful!')
  }
}

testConnection()
