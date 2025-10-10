-- Adicionar índices para otimizar queries de pagamento

-- Índice para acelerar verificações de pagamento em payroll_closings
CREATE INDEX IF NOT EXISTS idx_payroll_closings_event_personnel_amount 
ON payroll_closings(event_id, personnel_id, total_amount_paid)
WHERE total_amount_paid > 0;

-- Índice para acelerar joins em personnel_allocations
CREATE INDEX IF NOT EXISTS idx_personnel_allocations_event_personnel 
ON personnel_allocations(event_id, personnel_id);

-- Índice para filtros de eventos por status e data
CREATE INDEX IF NOT EXISTS idx_events_status_end_date_team 
ON events(team_id, status, end_date) 
WHERE status IN ('concluido', 'concluido_pagamento_pendente', 'em_andamento');

-- Índice para busca de eventos por data de vencimento
CREATE INDEX IF NOT EXISTS idx_events_payment_due_date 
ON events(payment_due_date, team_id) 
WHERE payment_due_date IS NOT NULL;

-- Índice composto para otimizar a função get_events_with_payment_status
CREATE INDEX IF NOT EXISTS idx_personnel_allocations_team_event 
ON personnel_allocations(team_id, event_id);

COMMENT ON INDEX idx_payroll_closings_event_personnel_amount IS 
'Otimiza verificação de pagamentos completos por evento e pessoa';

COMMENT ON INDEX idx_personnel_allocations_event_personnel IS 
'Acelera joins entre alocações e pagamentos';

COMMENT ON INDEX idx_events_status_end_date_team IS 
'Otimiza filtros de eventos concluídos por equipe';

COMMENT ON INDEX idx_events_payment_due_date IS 
'Acelera busca de eventos por data de vencimento';

COMMENT ON INDEX idx_personnel_allocations_team_event IS 
'Otimiza a função get_events_with_payment_status';