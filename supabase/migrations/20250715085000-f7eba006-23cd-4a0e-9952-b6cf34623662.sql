-- Adiciona as colunas opcionais de CPF e CNPJ à tabela 'personnel'
ALTER TABLE public.personnel
ADD COLUMN cpf TEXT,
ADD COLUMN cnpj TEXT;

-- Adiciona comentários para descrever as novas colunas
COMMENT ON COLUMN public.personnel.cpf IS 'CPF do profissional (opcional).';
COMMENT ON COLUMN public.personnel.cnpj IS 'CNPJ do profissional, caso seja pessoa jurídica (opcional).';