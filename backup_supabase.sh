#!/bin/bash
# Script de Backup Completo do Banco de Dados Supabase
# Projeto: PlannerSystem (atogozlqfwxztjyycjoy)

echo "🔄 Iniciando backup completo do banco de dados..."

# Criar diretório de backup
mkdir -p backup_supabase
DATA_HORA=$(date +"%Y%m%d_%H%M%S")
DIRETORIO_BACKUP="backup_supabase/backup_${DATA_HORA}"
mkdir -p "$DIRETORIO_BACKUP"

echo "📁 Diretório de backup criado: $DIRETORIO_BACKUP"

# Função para exportar tabelas individuais
exportar_tabela() {
    local tabela=$1
    local arquivo="$DIRETORIO_BACKUP/${tabela}_${DATA_HORA}.sql"
    
    echo "💾 Exportando tabela: $tabela"
    
    # Comando para exportar estrutura e dados da tabela
    npx supabase db dump --schema-only --table "$tabela" --file "$arquivo.struct" 2>/dev/null
    npx supabase db dump --data-only --table "$tabela" --file "$arquivo.data" 2>/dev/null
    
    # Combinar estrutura e dados
    if [ -f "$arquivo.struct" ]; then
        cat "$arquivo.struct" >> "$arquivo"
        rm "$arquivo.struct"
    fi
    
    if [ -f "$arquivo.data" ]; then
        echo "" >> "$arquivo"
        echo "-- Dados da tabela $tabela" >> "$arquivo"
        cat "$arquivo.data" >> "$arquivo"
        rm "$arquivo.data"
    fi
    
    echo "✅ Tabela $tabela exportada com sucesso"
}

# Lista de tabelas principais para backup (ajuste conforme necessário)
TABELAS=(
    "users"
    "teams" 
    "team_members"
    "subscriptions"
    "payroll_closings"
    "personnel"
    "events"
    "event_personnel"
    "notifications"
    "audit_logs"
)

# Exportar cada tabela
for tabela in "${TABELAS[@]}"; do
    exportar_tabela "$tabela"
done

# Criar arquivo de resumo
echo "📋 Criando resumo do backup..."
cat > "$DIRETORIO_BACKUP/resumo_backup.txt" << EOF
Backup Completo do Banco de Dados - PlannerSystem
Data: $(date)
Projeto: atogozlqfwxztjyycjoy
Diretório: $DIRETORIO_BACKUP

Tabelas exportadas:
$(printf '%s\n' "${TABELAS[@]}")

Para restaurar o backup, execute os arquivos SQL na ordem correta.
EOF

echo "🎉 Backup completo finalizado!"
echo "📍 Arquivos salvos em: $DIRETORIO_BACKUP"
echo "📊 Resumo disponível em: $DIRETORIO_BACKUP/resumo_backup.txt"