-- Adicionar coluna is_primary à tabela personnel_functions
ALTER TABLE public.personnel_functions 
ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT false;

-- Criar índice único para garantir apenas uma função primária por pessoa
CREATE UNIQUE INDEX idx_personnel_primary_function 
ON public.personnel_functions (personnel_id) 
WHERE is_primary = true;

-- Migrar dados existentes: definir a primeira função (por created_at) como primária
WITH first_functions AS (
  SELECT DISTINCT ON (personnel_id) 
    personnel_id,
    function_id
  FROM public.personnel_functions
  ORDER BY personnel_id, created_at ASC
)
UPDATE public.personnel_functions pf
SET is_primary = true
FROM first_functions ff
WHERE pf.personnel_id = ff.personnel_id 
  AND pf.function_id = ff.function_id;

-- Criar trigger para garantir que sempre existe uma função primária
CREATE OR REPLACE FUNCTION ensure_primary_function()
RETURNS TRIGGER AS $$
DECLARE
  v_next_function_id UUID;
BEGIN
  -- Se está inserindo e não há nenhuma função primária para este personnel_id, tornar esta primária
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.personnel_functions 
      WHERE personnel_id = NEW.personnel_id AND is_primary = true
    ) THEN
      NEW.is_primary = true;
    END IF;
  END IF;
  
  -- Se está deletando a função primária e ainda existem outras funções, promover a próxima
  IF TG_OP = 'DELETE' AND OLD.is_primary = true THEN
    SELECT function_id INTO v_next_function_id
    FROM public.personnel_functions
    WHERE personnel_id = OLD.personnel_id 
      AND function_id != OLD.function_id
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF v_next_function_id IS NOT NULL THEN
      UPDATE public.personnel_functions
      SET is_primary = true
      WHERE personnel_id = OLD.personnel_id 
        AND function_id = v_next_function_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ensure_primary_function_trigger
BEFORE INSERT OR DELETE ON public.personnel_functions
FOR EACH ROW
EXECUTE FUNCTION ensure_primary_function();