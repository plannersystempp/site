-- ============================================================================
-- MIGRAÇÃO: Sanitização Automática e Correção de Índices Únicos - Personnel
-- ============================================================================
-- 
-- Objetivo: Resolver problemas de salvamento de dados em branco e duplicidade
-- artificial de CPF/CNPJ vazios, garantindo que:
-- 1. Strings vazias sejam convertidas em NULL automaticamente
-- 2. Índices únicos só validem valores não-nulos e não-vazios
-- 3. Unicidade seja respeitada por equipe (team_id)
--
-- ============================================================================

-- 1. CRIAR FUNÇÃO DE SANITIZAÇÃO
-- ============================================================================
-- Esta função converte strings vazias em NULL para todos os campos opcionais
-- antes de INSERT ou UPDATE, evitando problemas de unique constraint com ''

CREATE OR REPLACE FUNCTION public.sanitize_personnel_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Documentos
  IF NEW.cpf IS NOT NULL AND trim(NEW.cpf) = '' THEN
    NEW.cpf := NULL;
  END IF;
  
  IF NEW.cnpj IS NOT NULL AND trim(NEW.cnpj) = '' THEN
    NEW.cnpj := NULL;
  END IF;
  
  -- Contatos
  IF NEW.email IS NOT NULL AND trim(NEW.email) = '' THEN
    NEW.email := NULL;
  END IF;
  
  IF NEW.phone IS NOT NULL AND trim(NEW.phone) = '' THEN
    NEW.phone := NULL;
  END IF;
  
  IF NEW.phone_secondary IS NOT NULL AND trim(NEW.phone_secondary) = '' THEN
    NEW.phone_secondary := NULL;
  END IF;
  
  -- Foto
  IF NEW.photo_url IS NOT NULL AND trim(NEW.photo_url) = '' THEN
    NEW.photo_url := NULL;
  END IF;
  
  -- Tamanho de camisa
  IF NEW.shirt_size IS NOT NULL AND trim(NEW.shirt_size) = '' THEN
    NEW.shirt_size := NULL;
  END IF;
  
  -- Endereço completo
  IF NEW.address_zip_code IS NOT NULL AND trim(NEW.address_zip_code) = '' THEN
    NEW.address_zip_code := NULL;
  END IF;
  
  IF NEW.address_street IS NOT NULL AND trim(NEW.address_street) = '' THEN
    NEW.address_street := NULL;
  END IF;
  
  IF NEW.address_number IS NOT NULL AND trim(NEW.address_number) = '' THEN
    NEW.address_number := NULL;
  END IF;
  
  IF NEW.address_complement IS NOT NULL AND trim(NEW.address_complement) = '' THEN
    NEW.address_complement := NULL;
  END IF;
  
  IF NEW.address_neighborhood IS NOT NULL AND trim(NEW.address_neighborhood) = '' THEN
    NEW.address_neighborhood := NULL;
  END IF;
  
  IF NEW.address_city IS NOT NULL AND trim(NEW.address_city) = '' THEN
    NEW.address_city := NULL;
  END IF;
  
  IF NEW.address_state IS NOT NULL AND trim(NEW.address_state) = '' THEN
    NEW.address_state := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentário da função
COMMENT ON FUNCTION public.sanitize_personnel_fields() IS 
'Converte strings vazias em NULL para campos opcionais de personnel antes de INSERT/UPDATE';


-- 2. APLICAR TRIGGER NA TABELA PERSONNEL
-- ============================================================================

DROP TRIGGER IF EXISTS sanitize_personnel_before_save ON public.personnel;

CREATE TRIGGER sanitize_personnel_before_save
  BEFORE INSERT OR UPDATE ON public.personnel
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_personnel_fields();

COMMENT ON TRIGGER sanitize_personnel_before_save ON public.personnel IS 
'Sanitiza campos vazios convertendo para NULL antes de salvar';


-- 3. BACKFILL: LIMPAR DADOS EXISTENTES
-- ============================================================================
-- Converter strings vazias existentes em NULL para evitar problemas retroativos

UPDATE public.personnel
SET 
  cpf = CASE WHEN trim(COALESCE(cpf, '')) = '' THEN NULL ELSE cpf END,
  cnpj = CASE WHEN trim(COALESCE(cnpj, '')) = '' THEN NULL ELSE cnpj END,
  email = CASE WHEN trim(COALESCE(email, '')) = '' THEN NULL ELSE email END,
  phone = CASE WHEN trim(COALESCE(phone, '')) = '' THEN NULL ELSE phone END,
  phone_secondary = CASE WHEN trim(COALESCE(phone_secondary, '')) = '' THEN NULL ELSE phone_secondary END,
  photo_url = CASE WHEN trim(COALESCE(photo_url, '')) = '' THEN NULL ELSE photo_url END,
  shirt_size = CASE WHEN trim(COALESCE(shirt_size, '')) = '' THEN NULL ELSE shirt_size END,
  address_zip_code = CASE WHEN trim(COALESCE(address_zip_code, '')) = '' THEN NULL ELSE address_zip_code END,
  address_street = CASE WHEN trim(COALESCE(address_street, '')) = '' THEN NULL ELSE address_street END,
  address_number = CASE WHEN trim(COALESCE(address_number, '')) = '' THEN NULL ELSE address_number END,
  address_complement = CASE WHEN trim(COALESCE(address_complement, '')) = '' THEN NULL ELSE address_complement END,
  address_neighborhood = CASE WHEN trim(COALESCE(address_neighborhood, '')) = '' THEN NULL ELSE address_neighborhood END,
  address_city = CASE WHEN trim(COALESCE(address_city, '')) = '' THEN NULL ELSE address_city END,
  address_state = CASE WHEN trim(COALESCE(address_state, '')) = '' THEN NULL ELSE address_state END
WHERE 
  trim(COALESCE(cpf, '')) = '' OR
  trim(COALESCE(cnpj, '')) = '' OR
  trim(COALESCE(email, '')) = '' OR
  trim(COALESCE(phone, '')) = '' OR
  trim(COALESCE(phone_secondary, '')) = '' OR
  trim(COALESCE(photo_url, '')) = '' OR
  trim(COALESCE(shirt_size, '')) = '' OR
  trim(COALESCE(address_zip_code, '')) = '' OR
  trim(COALESCE(address_street, '')) = '' OR
  trim(COALESCE(address_number, '')) = '' OR
  trim(COALESCE(address_complement, '')) = '' OR
  trim(COALESCE(address_neighborhood, '')) = '' OR
  trim(COALESCE(address_city, '')) = '' OR
  trim(COALESCE(address_state, '')) = '';


-- 4. RECRIAR ÍNDICES ÚNICOS COM LÓGICA CORRETA
-- ============================================================================
-- Índices únicos parciais que:
-- - Ignoram valores NULL e strings vazias
-- - Garantem unicidade por equipe (team_id)
-- - Evitam conflitos artificiais com múltiplos registros vazios

-- 4.1 Remover índices antigos (se existirem)
DROP INDEX IF EXISTS public.idx_personnel_cpf_unique;
DROP INDEX IF EXISTS public.idx_personnel_cnpj_unique;
DROP INDEX IF EXISTS public.unique_personnel_cpf;
DROP INDEX IF EXISTS public.unique_personnel_cnpj;

-- 4.2 Criar índices únicos parciais corretos
CREATE UNIQUE INDEX IF NOT EXISTS unique_personnel_cpf_per_team
  ON public.personnel(team_id, cpf)
  WHERE cpf IS NOT NULL AND trim(cpf) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS unique_personnel_cnpj_per_team
  ON public.personnel(team_id, cnpj)
  WHERE cnpj IS NOT NULL AND trim(cnpj) <> '';

-- Comentários dos índices
COMMENT ON INDEX public.unique_personnel_cpf_per_team IS 
'Garante unicidade de CPF por equipe, ignorando valores NULL ou vazios';

COMMENT ON INDEX public.unique_personnel_cnpj_per_team IS 
'Garante unicidade de CNPJ por equipe, ignorando valores NULL ou vazios';


-- ============================================================================
-- VERIFICAÇÕES PÓS-MIGRAÇÃO
-- ============================================================================

-- Verificar trigger criado
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'sanitize_personnel_before_save'
  ) THEN
    RAISE EXCEPTION 'Trigger sanitize_personnel_before_save não foi criado';
  END IF;
END $$;

-- Verificar índices criados
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'unique_personnel_cpf_per_team'
  ) THEN
    RAISE EXCEPTION 'Índice unique_personnel_cpf_per_team não foi criado';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'unique_personnel_cnpj_per_team'
  ) THEN
    RAISE EXCEPTION 'Índice unique_personnel_cnpj_per_team não foi criado';
  END IF;
END $$;

-- Log de sucesso
DO $$ 
BEGIN
  RAISE NOTICE 'Migração concluída com sucesso: sanitização automática e índices únicos parciais aplicados';
END $$;