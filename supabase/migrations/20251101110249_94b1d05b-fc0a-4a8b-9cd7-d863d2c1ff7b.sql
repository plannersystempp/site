-- ============================================
-- FUNÇÃO RPC: ESTATÍSTICAS DO DASHBOARD SUPERADMIN
-- ============================================

-- Função para obter estatísticas do dashboard do superadmin
CREATE OR REPLACE FUNCTION public.get_superadmin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  user_growth_data jsonb;
  mrr_history_data jsonb;
  top_teams_data jsonb;
  stats_summary jsonb;
BEGIN
  -- Verificar se é superadmin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas superadmins podem acessar estas estatísticas';
  END IF;

  -- 1. Crescimento de usuários (últimos 30 dias)
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', date,
      'count', count
    ) ORDER BY date
  ) INTO user_growth_data
  FROM (
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM user_profiles
    WHERE created_at >= NOW() - INTERVAL '30 days'
      AND created_at < NOW()
    GROUP BY DATE(created_at)
    ORDER BY date
  ) daily_users;

  -- 2. MRR History (últimos 6 meses)
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', month,
      'mrr', mrr
    ) ORDER BY month
  ) INTO mrr_history_data
  FROM (
    SELECT 
      TO_CHAR(DATE_TRUNC('month', ts.created_at), 'YYYY-MM') as month,
      SUM(sp.price) as mrr
    FROM team_subscriptions ts
    JOIN subscription_plans sp ON ts.plan_id = sp.id
    WHERE ts.status = 'active'
      AND ts.created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', ts.created_at)
    ORDER BY month
  ) monthly_mrr;

  -- 3. Top 5 equipes mais ativas (por número de eventos)
  SELECT jsonb_agg(
    jsonb_build_object(
      'team_id', team_id,
      'team_name', team_name,
      'event_count', event_count,
      'member_count', member_count
    ) ORDER BY event_count DESC
  ) INTO top_teams_data
  FROM (
    SELECT 
      t.id as team_id,
      t.name as team_name,
      COUNT(DISTINCT e.id) as event_count,
      COUNT(DISTINCT tm.user_id) as member_count
    FROM teams t
    LEFT JOIN events e ON e.team_id = t.id
    LEFT JOIN team_members tm ON tm.team_id = t.id AND tm.status = 'approved'
    WHERE t.is_system = false
    GROUP BY t.id, t.name
    ORDER BY event_count DESC
    LIMIT 5
  ) top_teams;

  -- 4. Resumo de estatísticas
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM user_profiles),
    'active_users', (SELECT COUNT(*) FROM user_profiles WHERE is_approved = true),
    'total_teams', (SELECT COUNT(*) FROM teams WHERE is_system = false),
    'active_subscriptions', (SELECT COUNT(*) FROM team_subscriptions WHERE status = 'active'),
    'trial_subscriptions', (SELECT COUNT(*) FROM team_subscriptions WHERE status = 'trial'),
    'total_events', (SELECT COUNT(*) FROM events),
    'total_personnel', (SELECT COUNT(*) FROM personnel),
    'current_mrr', (
      SELECT COALESCE(SUM(sp.price), 0)
      FROM team_subscriptions ts
      JOIN subscription_plans sp ON ts.plan_id = sp.id
      WHERE ts.status = 'active'
    ),
    'trial_conversion_rate', (
      SELECT ROUND(
        CASE 
          WHEN COUNT(*) FILTER (WHERE status IN ('trial', 'active')) > 0
          THEN (COUNT(*) FILTER (WHERE status = 'active')::numeric / 
                COUNT(*) FILTER (WHERE status IN ('trial', 'active'))::numeric * 100)
          ELSE 0
        END, 2
      )
      FROM team_subscriptions
    ),
    'expiring_trials_7d', (
      SELECT COUNT(*)
      FROM team_subscriptions
      WHERE status = 'trial'
        AND trial_ends_at IS NOT NULL
        AND trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    ),
    'orphan_users', (
      SELECT COUNT(*)
      FROM user_profiles up
      WHERE NOT EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.user_id = up.user_id 
          AND tm.status = 'approved'
      )
      AND up.is_approved = true
    ),
    'unassigned_errors', (
      SELECT COUNT(*)
      FROM error_reports
      WHERE status = 'new'
        AND assigned_to IS NULL
    )
  ) INTO stats_summary;

  -- Construir resultado final
  result := jsonb_build_object(
    'user_growth', COALESCE(user_growth_data, '[]'::jsonb),
    'mrr_history', COALESCE(mrr_history_data, '[]'::jsonb),
    'top_teams', COALESCE(top_teams_data, '[]'::jsonb),
    'stats', stats_summary
  );

  RETURN result;
END;
$$;