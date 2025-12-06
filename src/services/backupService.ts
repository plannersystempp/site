import { supabase } from '@/integrations/supabase/client'

export async function triggerBackup(opts?: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke('database-backup', { body: opts || {} })
  if (error) throw error
  return data
}

export async function listBackups(limit = 50) {
  const { data, error } = await supabase
    .from('backup_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function restoreBackup(fileKey: string, format: 'json'|'sql') {
  const { data, error } = await supabase.functions.invoke('database-restore', { body: { fileKey, format } })
  if (error) throw error
  return data
}
