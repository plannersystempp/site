-- Adicionar novos campos para cadastro PJ completo de fornecedores
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS cnpj TEXT,
  ADD COLUMN IF NOT EXISTS state_registration TEXT,
  ADD COLUMN IF NOT EXISTS municipal_registration TEXT,
  
  ADD COLUMN IF NOT EXISTS address_zip_code TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  
  ADD COLUMN IF NOT EXISTS phone_secondary TEXT;

-- Adicionar índice no CNPJ para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_suppliers_cnpj ON public.suppliers(cnpj) WHERE cnpj IS NOT NULL;

-- Adicionar comentários nas colunas para documentação
COMMENT ON COLUMN public.suppliers.name IS 'Nome Fantasia';
COMMENT ON COLUMN public.suppliers.legal_name IS 'Razão Social';
COMMENT ON COLUMN public.suppliers.cnpj IS 'CNPJ no formato 00.000.000/0000-00';
COMMENT ON COLUMN public.suppliers.state_registration IS 'Inscrição Estadual';
COMMENT ON COLUMN public.suppliers.municipal_registration IS 'Inscrição Municipal';
COMMENT ON COLUMN public.suppliers.phone IS 'Telefone Principal';
COMMENT ON COLUMN public.suppliers.phone_secondary IS 'Telefone Secundário';