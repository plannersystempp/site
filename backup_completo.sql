-- Backup Completo do Banco de Dados - PlannerSystem
-- Data: $(date)
-- Projeto: atogozlqfwxztjyycjoy

-- Desabilitar verificações de chave estrangeira temporariamente
SET session_replication_role = replica;

-- Criar schema de backup se não existir
CREATE SCHEMA IF NOT EXISTS backup_history;

-- Criar tabela de log de backup
CREATE TABLE IF NOT EXISTS backup_history.backup_log (
    id SERIAL PRIMARY KEY,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_type VARCHAR(50) DEFAULT 'FULL',
    tables_backed_up INTEGER,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS'
);

-- Iniciar log de backup
INSERT INTO backup_history.backup_log (backup_type, tables_backed_up) VALUES ('FULL', 0) RETURNING id;

-- Listar todas as tabelas do schema public (exceto tabelas do próprio backup)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'backup_%'
ORDER BY table_name;

-- Gerar comandos COPY para cada tabela
SELECT 'COPY public.' || table_name || ' TO ''/tmp/' || table_name || '.csv'' CSV HEADER;' as copy_command
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'backup_%'
ORDER BY table_name;

-- Contar registros por tabela (para verificação)
SELECT table_name, 
       (SELECT COUNT(*) FROM public.table_name) as record_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'backup_%'
ORDER BY table_name;

-- Atualizar log de backup como concluído
UPDATE backup_history.backup_log 
SET status = 'COMPLETED', 
    tables_backed_up = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name NOT LIKE 'backup_%')
WHERE status = 'IN_PROGRESS';

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = DEFAULT;