-- Criar função SQL get_events_with_payment_status
CREATE OR REPLACE FUNCTION get_events_with_payment_status(p_team_id UUID)
RETURNS TABLE (
  event_id UUID,
  event_name TEXT,
  event_status TEXT,
  end_date DATE,
  payment_due_date DATE,
  allocated_count INT,
  paid_count INT,
  has_pending_payments BOOLEAN
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    e.name as event_name,
    e.status as event_status,
    e.end_date,
    e.payment_due_date,
    COUNT(DISTINCT pa.personnel_id)::INT as allocated_count,
    COUNT(DISTINCT CASE 
      WHEN pc.total_amount_paid > 0 THEN pc.personnel_id 
      ELSE NULL 
    END)::INT as paid_count,
    EXISTS(
      SELECT 1 
      FROM personnel_allocations pa2 
      WHERE pa2.event_id = e.id
      AND NOT EXISTS (
        SELECT 1 
        FROM payroll_closings pc2
        WHERE pc2.event_id = pa2.event_id
          AND pc2.personnel_id = pa2.personnel_id
          AND pc2.total_amount_paid > 0
      )
    ) as has_pending_payments
  FROM events e
  LEFT JOIN personnel_allocations pa ON e.id = pa.event_id
  LEFT JOIN payroll_closings pc ON e.id = pc.event_id AND pa.personnel_id = pc.personnel_id
  WHERE e.team_id = p_team_id
  GROUP BY e.id, e.name, e.status, e.end_date, e.payment_due_date
  ORDER BY e.end_date DESC;
END;
$$;

-- Garantir que a função pode ser chamada via RPC
GRANT EXECUTE ON FUNCTION get_events_with_payment_status(UUID) TO authenticated;

COMMENT ON FUNCTION get_events_with_payment_status IS 
'Retorna eventos com informações agregadas de pagamento para otimizar Dashboard e EventSelector';

-- Corrigir status de eventos com alocações mas sem pagamentos
UPDATE events 
SET status = 'concluido_pagamento_pendente'
WHERE status = 'concluido'
  AND end_date < CURRENT_DATE
  AND EXISTS (
    SELECT 1 FROM personnel_allocations pa
    WHERE pa.event_id = events.id
  )
  AND NOT EXISTS (
    SELECT 1 
    FROM personnel_allocations pa2
    INNER JOIN payroll_closings pc ON pa2.event_id = pc.event_id 
      AND pa2.personnel_id = pc.personnel_id 
      AND pc.total_amount_paid > 0
    WHERE pa2.event_id = events.id
    GROUP BY pa2.event_id
    HAVING COUNT(DISTINCT pa2.personnel_id) = (
      SELECT COUNT(DISTINCT pa3.personnel_id)
      FROM personnel_allocations pa3
      WHERE pa3.event_id = events.id
    )
  );

-- Log dos eventos atualizados
DO $$
DECLARE
  updated_count INT;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM events
  WHERE status = 'concluido_pagamento_pendente'
    AND end_date < CURRENT_DATE;
  
  RAISE NOTICE 'Total de eventos com status concluido_pagamento_pendente: %', updated_count;
END $$;