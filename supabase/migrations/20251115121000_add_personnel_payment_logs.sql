-- Logs de alterações de pagamento avulso (registrar datas de pagamento e cancelamento)
CREATE TABLE IF NOT EXISTS public.personnel_payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_payment_id UUID NOT NULL REFERENCES public.personnel_payments(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('paid','cancelled')),
  method TEXT,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  by_id UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON public.personnel_payment_logs(personnel_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_action ON public.personnel_payment_logs(action);

ALTER TABLE public.personnel_payment_logs ENABLE ROW LEVEL SECURITY;

-- Visualização permitida a membros da equipe do pagamento
CREATE POLICY "Team members can view payment logs"
  ON public.personnel_payment_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.personnel_payments p
      WHERE p.id = personnel_payment_id AND (is_team_member(p.team_id) OR is_super_admin())
    )
  );

-- Inserção permitida a admins/financeiro (via app)
CREATE POLICY "Admins and financeiro can insert payment logs"
  ON public.personnel_payment_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.personnel_payments p
      WHERE p.id = personnel_payment_id AND get_user_role_in_team(p.team_id) IN ('admin','financeiro')
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.personnel_payment_logs;