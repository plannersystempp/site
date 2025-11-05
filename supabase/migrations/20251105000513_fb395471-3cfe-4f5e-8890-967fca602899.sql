-- ============================================
-- TABELA: personnel_payments
-- Sistema de Pagamentos Avulsos para pessoal
-- ============================================

CREATE TABLE IF NOT EXISTS public.personnel_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  personnel_id UUID NOT NULL REFERENCES public.personnel(id) ON DELETE CASCADE,
  
  -- Financeiro
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_due_date DATE NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  paid_by_id UUID REFERENCES auth.users(id),
  
  -- Relacionamento com eventos (array para múltiplos eventos)
  related_events UUID[] DEFAULT '{}',
  
  -- Descrição e notas
  description TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by_id UUID REFERENCES auth.users(id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_personnel_payments_team_id 
  ON public.personnel_payments(team_id);

CREATE INDEX IF NOT EXISTS idx_personnel_payments_personnel_id 
  ON public.personnel_payments(personnel_id);

CREATE INDEX IF NOT EXISTS idx_personnel_payments_status 
  ON public.personnel_payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_personnel_payments_due_date 
  ON public.personnel_payments(payment_due_date);

CREATE INDEX IF NOT EXISTS idx_personnel_payments_related_events 
  ON public.personnel_payments USING GIN(related_events);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_personnel_payments_updated_at
  BEFORE UPDATE ON public.personnel_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para audit log
CREATE TRIGGER enhanced_audit_log_personnel_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.personnel_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.enhanced_audit_log();

-- Trigger para auto-preencher paid_by_id quando marcar como pago
CREATE TRIGGER set_paid_by_on_personnel_payment
  BEFORE INSERT OR UPDATE ON public.personnel_payments
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid' AND NEW.paid_by_id IS NULL)
  EXECUTE FUNCTION public.payroll_closings_set_paid_by();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.personnel_payments ENABLE ROW LEVEL SECURITY;

-- Membros da equipe podem visualizar (incluindo coordenadores)
CREATE POLICY "Team members can view personnel payments"
  ON public.personnel_payments
  FOR SELECT
  USING (
    is_team_member(team_id) OR is_super_admin()
  );

-- Admins e financeiro podem inserir
CREATE POLICY "Admins and financeiro can insert personnel payments"
  ON public.personnel_payments
  FOR INSERT
  WITH CHECK (
    get_user_role_in_team(team_id) IN ('admin', 'financeiro')
  );

-- Admins e financeiro podem atualizar
CREATE POLICY "Admins and financeiro can update personnel payments"
  ON public.personnel_payments
  FOR UPDATE
  USING (
    get_user_role_in_team(team_id) IN ('admin', 'financeiro')
  )
  WITH CHECK (
    get_user_role_in_team(team_id) IN ('admin', 'financeiro')
  );

-- Apenas admins podem deletar
CREATE POLICY "Admins can delete personnel payments"
  ON public.personnel_payments
  FOR DELETE
  USING (
    get_user_role_in_team(team_id) = 'admin'
  );

-- ============================================
-- REALTIME
-- ============================================

ALTER TABLE public.personnel_payments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.personnel_payments;