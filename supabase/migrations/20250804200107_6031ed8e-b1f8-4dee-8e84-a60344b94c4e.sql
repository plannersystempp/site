-- Adicionar coluna para controlar aceite dos termos de uso
ALTER TABLE public.user_profiles 
ADD COLUMN terms_accepted_at TIMESTAMPTZ DEFAULT NULL;