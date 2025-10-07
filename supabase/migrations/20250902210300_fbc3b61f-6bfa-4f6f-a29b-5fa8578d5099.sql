-- Enhanced audit logs function with human-readable information
CREATE OR REPLACE FUNCTION public.get_audit_logs_for_superadmin_enriched(
  search_text text DEFAULT NULL::text, 
  team_filter uuid DEFAULT NULL::uuid, 
  action_filter text DEFAULT NULL::text, 
  start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, 
  end_date timestamp with time zone DEFAULT NULL::timestamp with time zone
)
RETURNS TABLE(
  id uuid, 
  user_name text, 
  user_email text, 
  team_name text, 
  action text, 
  table_name text, 
  entity_name text,
  record_id text, 
  old_values jsonb, 
  new_values jsonb,
  changed_fields jsonb,
  action_summary text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH enriched_logs AS (
    SELECT 
      al.id,
      up.name as user_name,
      up.email as user_email,
      t.name as team_name,
      al.action,
      al.table_name,
      al.record_id,
      al.old_values,
      al.new_values,
      al.created_at,
      -- Generate entity name based on table and record
      CASE 
        WHEN al.table_name = 'events' AND al.new_values ? 'name' THEN 
          'Evento: ' || (al.new_values->>'name')
        WHEN al.table_name = 'events' AND al.old_values ? 'name' THEN 
          'Evento: ' || (al.old_values->>'name')
        WHEN al.table_name = 'personnel' AND al.new_values ? 'name' THEN 
          'Pessoal: ' || (al.new_values->>'name')
        WHEN al.table_name = 'personnel' AND al.old_values ? 'name' THEN 
          'Pessoal: ' || (al.old_values->>'name')
        WHEN al.table_name = 'teams' AND al.new_values ? 'name' THEN 
          'Equipe: ' || (al.new_values->>'name')
        WHEN al.table_name = 'teams' AND al.old_values ? 'name' THEN 
          'Equipe: ' || (al.old_values->>'name')
        WHEN al.table_name = 'user_profiles' AND al.new_values ? 'name' THEN 
          'Usuário: ' || (al.new_values->>'name')
        WHEN al.table_name = 'user_profiles' AND al.old_values ? 'name' THEN 
          'Usuário: ' || (al.old_values->>'name')
        WHEN al.table_name = 'functions' AND al.new_values ? 'name' THEN 
          'Função: ' || (al.new_values->>'name')
        WHEN al.table_name = 'functions' AND al.old_values ? 'name' THEN 
          'Função: ' || (al.old_values->>'name')
        ELSE 
          CASE al.table_name
            WHEN 'events' THEN 'Evento'
            WHEN 'personnel' THEN 'Pessoal'
            WHEN 'teams' THEN 'Equipe'
            WHEN 'user_profiles' THEN 'Usuário'
            WHEN 'functions' THEN 'Função'
            WHEN 'work_records' THEN 'Registro de Trabalho'
            WHEN 'personnel_allocations' THEN 'Alocação de Pessoal'
            WHEN 'payroll_closings' THEN 'Fechamento de Folha'
            WHEN 'team_members' THEN 'Membro da Equipe'
            ELSE al.table_name
          END
      END as entity_name,
      
      -- Generate changed fields summary for UPDATE actions
      CASE 
        WHEN al.action = 'UPDATE' AND al.old_values IS NOT NULL AND al.new_values IS NOT NULL THEN
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'field', key,
                'old_value', al.old_values->key,
                'new_value', al.new_values->key,
                'field_label', 
                CASE key
                  WHEN 'name' THEN 'Nome'
                  WHEN 'email' THEN 'E-mail'
                  WHEN 'role' THEN 'Papel'
                  WHEN 'status' THEN 'Status'
                  WHEN 'is_approved' THEN 'Aprovado'
                  WHEN 'start_date' THEN 'Data de Início'
                  WHEN 'end_date' THEN 'Data de Fim'
                  WHEN 'description' THEN 'Descrição'
                  WHEN 'monthly_salary' THEN 'Salário Mensal'
                  WHEN 'event_cache' THEN 'Cachê do Evento'
                  WHEN 'type' THEN 'Tipo'
                  WHEN 'phone' THEN 'Telefone'
                  WHEN 'cpf' THEN 'CPF'
                  WHEN 'cnpj' THEN 'CNPJ'
                  ELSE key
                END
              )
            )
            FROM jsonb_each(al.new_values)
            WHERE al.old_values->key IS DISTINCT FROM al.new_values->key
          )
        ELSE NULL
      END as changed_fields,
      
      -- Generate action summary
      CASE al.action
        WHEN 'INSERT' THEN 'Criou'
        WHEN 'UPDATE' THEN 'Atualizou'
        WHEN 'DELETE' THEN 'Deletou'
        WHEN 'TEAM_ACCESS_REQUEST' THEN 'Solicitou acesso à equipe'
        WHEN 'ROLE_UPDATE' THEN 'Atualizou papel do usuário'
        WHEN 'PERSONNEL_CREATE' THEN 'Criou pessoal'
        ELSE al.action
      END as action_summary
      
    FROM public.audit_logs al
    LEFT JOIN public.user_profiles up ON al.user_id = up.user_id
    LEFT JOIN public.teams t ON al.team_id = t.id
    WHERE EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'superadmin'
    )
    AND (search_text IS NULL OR 
         up.name ILIKE '%' || search_text || '%' OR 
         up.email ILIKE '%' || search_text || '%')
    AND (team_filter IS NULL OR al.team_id = team_filter)
    AND (action_filter IS NULL OR al.action = action_filter)
    AND (start_date IS NULL OR al.created_at >= start_date)
    AND (end_date IS NULL OR al.created_at <= end_date)
  )
  
  SELECT 
    el.id,
    el.user_name,
    el.user_email,
    el.team_name,
    el.action,
    el.table_name,
    el.entity_name,
    el.record_id,
    el.old_values,
    el.new_values,
    el.changed_fields,
    el.action_summary,
    el.created_at
  FROM enriched_logs el
  ORDER BY el.created_at DESC
  LIMIT 1000;
$function$