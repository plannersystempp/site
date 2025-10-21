-- FASE 1: Limpeza de URLs de foto inválidas
-- Esta migração identifica e limpa URLs de fotos que não são mais válidas

-- Função para validar se uma URL de foto é válida (básica)
-- URLs válidas devem conter o domínio do Supabase Storage
CREATE OR REPLACE FUNCTION is_valid_photo_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Se é NULL ou vazio, é válido (NULL)
  IF url IS NULL OR url = '' THEN
    RETURN TRUE;
  END IF;
  
  -- Deve conter o caminho para personnel-photos
  IF url LIKE '%personnel-photos%' THEN
    RETURN TRUE;
  END IF;
  
  -- Qualquer outra coisa é inválida
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limpar URLs inválidas (converter para NULL)
UPDATE public.personnel 
SET photo_url = NULL 
WHERE photo_url IS NOT NULL 
  AND photo_url != '' 
  AND NOT is_valid_photo_url(photo_url);

-- Relatório: quantas URLs foram limpas
DO $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cleaned_count
  FROM public.personnel
  WHERE photo_url IS NULL;
  
  RAISE NOTICE 'Photo URL cleanup complete. % personnel records without photos', cleaned_count;
END $$;