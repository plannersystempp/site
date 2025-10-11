-- 1. Adicionar novas colunas de preferências
ALTER TABLE user_notification_preferences 
ADD COLUMN IF NOT EXISTS event_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS event_start_24h BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS event_start_48h BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allocation_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS absence_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS status_changes BOOLEAN DEFAULT false;

-- 2. Renomear coluna 'read' para 'is_read' na tabela notifications (se necessário)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'read'
  ) THEN
    ALTER TABLE notifications RENAME COLUMN "read" TO is_read;
  END IF;
END $$;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_user_team 
ON user_notification_preferences(user_id, team_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, is_read, created_at DESC);

-- 4. Função para criar preferências padrão
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notification_preferences (
    user_id,
    team_id,
    enabled,
    event_reminders,
    payment_reminders,
    event_start_24h,
    event_start_48h,
    allocation_updates,
    absence_alerts,
    status_changes,
    event_updates,
    payment_received,
    team_invites
  ) VALUES (
    NEW.user_id,
    NEW.team_id,
    true,      -- enabled
    true,      -- event_reminders
    true,      -- payment_reminders
    true,      -- event_start_24h
    false,     -- event_start_48h
    true,      -- allocation_updates
    true,      -- absence_alerts
    false,     -- status_changes
    true,      -- event_updates (existente)
    true,      -- payment_received (existente)
    true       -- team_invites (existente)
  ) ON CONFLICT (user_id, team_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 5. Criar trigger para executar automaticamente
DROP TRIGGER IF EXISTS create_notif_prefs_on_team_join ON team_members;
CREATE TRIGGER create_notif_prefs_on_team_join
  AFTER INSERT ON team_members
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION create_default_notification_preferences();

-- 6. Comentários para documentação
COMMENT ON COLUMN user_notification_preferences.event_reminders IS 
'Receber lembretes gerais sobre eventos';

COMMENT ON COLUMN user_notification_preferences.event_start_24h IS 
'Notificar 24 horas antes do início de eventos';

COMMENT ON COLUMN user_notification_preferences.event_start_48h IS 
'Notificar 48 horas antes do início de eventos';

COMMENT ON COLUMN user_notification_preferences.allocation_updates IS 
'Notificar sobre novas alocações em eventos';

COMMENT ON COLUMN user_notification_preferences.absence_alerts IS 
'Notificar sobre ausências registradas';

COMMENT ON COLUMN user_notification_preferences.status_changes IS 
'Notificar sobre mudanças de status importantes';

COMMENT ON FUNCTION create_default_notification_preferences() IS 
'Cria preferências de notificação padrão quando um usuário entra em uma equipe';

-- 7. Popular preferências para usuários existentes
INSERT INTO user_notification_preferences (
  user_id, 
  team_id, 
  enabled,
  event_reminders,
  payment_reminders,
  event_start_24h,
  event_start_48h,
  allocation_updates,
  absence_alerts,
  status_changes,
  event_updates,
  payment_received,
  team_invites
)
SELECT 
  tm.user_id,
  tm.team_id,
  true,   -- enabled
  true,   -- event_reminders
  true,   -- payment_reminders
  true,   -- event_start_24h
  false,  -- event_start_48h
  true,   -- allocation_updates
  true,   -- absence_alerts
  false,  -- status_changes
  true,   -- event_updates
  true,   -- payment_received
  true    -- team_invites
FROM team_members tm
WHERE tm.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM user_notification_preferences unp
    WHERE unp.user_id = tm.user_id AND unp.team_id = tm.team_id
  );