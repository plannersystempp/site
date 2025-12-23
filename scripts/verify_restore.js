import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://epezxtdjfxnnfwutmisi.supabase.co'
const supabaseKey = 'sb_secret_pgRH_IQFNd1VNYvUxHmOwg_Tl7fUCt4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  const tables = ['teams', 'events', 'personnel', 'subscription_plans']
  
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
    if (error) console.error(`Error counting ${t}:`, error.message)
    else console.log(`Table ${t}: ${count} rows`)
  }
}

verify()
