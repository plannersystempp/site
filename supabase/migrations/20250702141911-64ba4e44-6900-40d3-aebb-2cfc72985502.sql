
-- Criar tabela para fechamentos de folha de pagamento
CREATE TABLE public.payroll_closings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  personnel_id UUID NOT NULL REFERENCES public.personnel(id) ON DELETE CASCADE,
  total_amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_by_id UUID NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para payroll_closings
ALTER TABLE public.payroll_closings ENABLE ROW LEVEL SECURITY;

-- Política para permitir usuários autenticados acessarem seus próprios dados
CREATE POLICY "Enable access for authenticated users only" 
  ON public.payroll_closings 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Indexar para melhor performance
CREATE INDEX idx_payroll_closings_event_personnel ON public.payroll_closings(event_id, personnel_id);
CREATE INDEX idx_payroll_closings_user ON public.payroll_closings(user_id);
