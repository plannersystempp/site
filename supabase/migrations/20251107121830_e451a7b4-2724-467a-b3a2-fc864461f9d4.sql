-- Adicionar coluna para dia de pagamento mensal dos fixos
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS monthly_payment_day INTEGER DEFAULT 5 CHECK (monthly_payment_day >= 1 AND monthly_payment_day <= 28);