-- Adicionar constraint para evitar alocações duplicadas da mesma pessoa no mesmo evento
-- com sobreposição de dias de trabalho

-- Primeiro, vamos verificar e limpar possíveis duplicatas existentes
WITH duplicates AS (
  SELECT 
    personnel_id, 
    event_id,
    array_agg(id ORDER BY created_at) as ids,
    array_agg(work_days ORDER BY created_at) as all_work_days
  FROM personnel_allocations
  GROUP BY personnel_id, event_id
  HAVING count(*) > 1
),
to_delete AS (
  SELECT 
    unnest(ids[2:]) as id_to_delete
  FROM duplicates
)
DELETE FROM personnel_allocations 
WHERE id IN (SELECT id_to_delete FROM to_delete);

-- Adicionar constraint única para personnel_id + event_id + work_days
-- Para evitar a mesma pessoa sendo alocada multiple vezes no mesmo evento com os mesmos dias
CREATE UNIQUE INDEX idx_personnel_allocation_unique 
ON personnel_allocations (personnel_id, event_id, work_days);

-- Função para verificar sobreposição de dias de trabalho
CREATE OR REPLACE FUNCTION check_work_days_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se existe alguma alocação da mesma pessoa no mesmo evento
  -- com pelo menos um dia de trabalho em comum
  IF EXISTS (
    SELECT 1 
    FROM personnel_allocations 
    WHERE personnel_id = NEW.personnel_id 
    AND event_id = NEW.event_id 
    AND id != COALESCE(NEW.id, '')
    AND work_days && NEW.work_days  -- Operador de sobreposição de arrays
  ) THEN
    RAISE EXCEPTION 'Esta pessoa já está alocada neste evento para alguns dos dias selecionados.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para verificar sobreposição antes de inserir ou atualizar
CREATE TRIGGER trigger_check_work_days_overlap
  BEFORE INSERT OR UPDATE ON personnel_allocations
  FOR EACH ROW
  EXECUTE FUNCTION check_work_days_overlap();