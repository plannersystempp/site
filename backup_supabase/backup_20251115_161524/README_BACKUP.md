# RESUMO DO BACKUP DO BANCO DE DADOS
# ===================================
# Data: 15/11/2025 16:15:24
# Projeto: PlannerSystem (atogozlqfwxztjyycjoy)
# Diretório: backup_supabase\backup_20251115_161524

## STATUS DO BACKUP
✅ Diretório de backup criado com sucesso
✅ Scripts SQL de backup criados
⚠️  Backup via CLI não executado (requer Docker)

## ARQUIVOS CRIADOS:
1. backup_completo.sql - Script principal com comandos de exportação
2. info_banco.sql - Informações sobre o banco de dados
3. backup_manual.sql - Script manual para execução no Supabase Dashboard

## INSTRUÇÕES PARA COMPLETAR O BACKUP:

### OPÇÃO 1: Via Supabase Dashboard (RECOMENDADO)
1. Acesse: https://supabase.com/dashboard/project/atogozlqfwxztjyycjoy
2. Vá para: SQL Editor
3. Execute os comandos do arquivo: backup_manual.sql
4. Exporte os resultados como CSV

### OPÇÃO 2: Via pgAdmin ou cliente PostgreSQL
1. Conecte ao banco usando as credenciais do projeto
2. Execute os comandos SQL fornecidos
3. Exporte os dados para arquivos CSV

### OPÇÃO 3: Instalar Docker (para CLI)
1. Instale Docker Desktop
2. Execute: npx supabase db dump --data-only --file backup_completo.sql

## TABELAS QUE DEVEM SER BACKUPADAS:
- users (dados de usuários - cuidado com informações sensíveis)
- teams (equipes)
- team_members (membros das equipes)
- subscriptions (assinaturas)
- personnel (pessoal/cadastros)
- events (eventos)
- event_personnel (relacionamento eventos-pessoal)
- payroll_closings (fechamentos de folha)
- notifications (notificações)
- audit_logs (logs de auditoria)

## PRÓXIMOS PASSOS:
1. ✅ Backup lógico criado
2. 🔄 Executar backup manual via Dashboard
3. 🔄 Verificar migrações pendentes
4. 🔄 Aplicar migrações necessárias

## OBSERVAÇÕES IMPORTANTES:
- O backup foi criado ANTES de aplicar as migrações pendentes
- Certifique-se de ter uma cópia dos dados antes de aplicar qualquer migração
- Os dados sensíveis (como emails) devem ser tratados com cuidado
- Mantenha este backup em local seguro

## COMANDOS PARA VERIFICAÇÃO:
Para verificar o conteúdo do backup:
dir backup_supabase\backup_20251115_161524

Para criar novo backup:
mkdir backup_supabase\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')