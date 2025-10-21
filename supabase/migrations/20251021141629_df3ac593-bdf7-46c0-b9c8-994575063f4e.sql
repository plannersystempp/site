-- Corrigir search_path da função is_valid_photo_url
CREATE OR REPLACE FUNCTION is_valid_photo_url(url TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;