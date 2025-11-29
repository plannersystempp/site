# Script de Backup Completo do Banco de Dados Supabase - Windows PowerShell
# Projeto: PlannerSystem (atogozlqfwxztjyycjoy)

Write-Host "Iniciando backup completo do banco de dados..." -ForegroundColor Green

# Criar diretório de backup
$dataHora = Get-Date -Format "yyyyMMdd_HHmmss"
$diretorioBackup = "backup_supabase\backup_$dataHora"
New-Item -ItemType Directory -Path $diretorioBackup -Force | Out-Null

Write-Host "Diretório de backup criado: $diretorioBackup" -ForegroundColor Yellow

# Função para exportar tabelas individuais
function Exportar-Tabela {
    param(
        [string]$tabela,
        [string]$diretorio,
        [string]$dataHora
    )
    
    Write-Host "Exportando tabela: $tabela" -ForegroundColor Cyan
    
    $arquivoEstrutura = "$diretorio\${tabela}_${dataHora}_estrutura.sql"
    $arquivoDados = "$diretorio\${tabela}_${dataHora}_dados.sql"
    $arquivoCompleto = "$diretorio\${tabela}_${dataHora}_completo.sql"
    
    try {
        # Exportar estrutura da tabela
        npx supabase db dump --schema-only --table "public.$tabela" --file $arquivoEstrutura 2>$null
        
        # Exportar dados da tabela
        npx supabase db dump --data-only --table "public.$tabela" --file $arquivoDados 2>$null
        
        # Combinar estrutura e dados em um arquivo único
        if (Test-Path $arquivoEstrutura) {
            Get-Content $arquivoEstrutura | Out-File -FilePath $arquivoCompleto -Encoding UTF8
            Add-Content -Path $arquivoCompleto -Value ""
            Add-Content -Path $arquivoCompleto -Value "-- Dados da tabela $tabela"
            Add-Content -Path $arquivoCompleto -Value ""
            
            if (Test-Path $arquivoDados) {
                Get-Content $arquivoDados | Out-File -FilePath $arquivoCompleto -Append -Encoding UTF8
                Remove-Item $arquivoDados -Force
            }
            
            Remove-Item $arquivoEstrutura -Force
        }
        
        Write-Host "Tabela $tabela exportada com sucesso" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Erro ao exportar tabela $tabela: $_" -ForegroundColor Red
        return $false
    }
}

# Lista de tabelas principais para backup
$tabelasPrincipais = @(
    "users",
    "teams", 
    "team_members",
    "subscriptions",
    "payroll_closings",
    "personnel",
    "events",
    "event_personnel",
    "notifications",
    "audit_logs"
)

$tabelasExportadas = @()

# Exportar cada tabela
foreach ($tabela in $tabelasPrincipais) {
    $sucesso = Exportar-Tabela -tabela $tabela -diretorio $diretorioBackup -dataHora $dataHora
    if ($sucesso) {
        $tabelasExportadas += $tabela
    }
}

# Criar arquivo de resumo
$resumoPath = "$diretorioBackup\resumo_backup.txt"
$resumoContent = @"
Backup Completo do Banco de Dados - PlannerSystem
Data: $(Get-Date)
Projeto: atogozlqfwxztjyycjoy
Diretório: $diretorioBackup

Tabelas exportadas com sucesso:
$($tabelasExportadas -join "`n")

Tabelas com falha:
$($tabelasPrincipais | Where-Object { $_ -notin $tabelasExportadas } | ForEach-Object { "ERRO: $_" })

Para restaurar o backup, execute os arquivos SQL na ordem correta.
"@

$resumoContent | Out-File -FilePath $resumoPath -Encoding UTF8

# Criar script de restauração
$restoreScript = @"
-- Script de Restauração do Backup
-- Executar na ordem das dependências

-- 1. Estrutura base (users, teams)
\i users_${dataHora}_completo.sql
\i teams_${dataHora}_completo.sql

-- 2. Relacionamentos (team_members, subscriptions)  
\i team_members_${dataHora}_completo.sql
\i subscriptions_${dataHora}_completo.sql

-- 3. Dados principais (personnel, events)
\i personnel_${dataHora}_completo.sql
\i events_${dataHora}_completo.sql

-- 4. Relacionamentos de eventos
\i event_personnel_${dataHora}_completo.sql

-- 5. Dados auxiliares
\i payroll_closings_${dataHora}_completo.sql
\i notifications_${dataHora}_completo.sql
\i audit_logs_${dataHora}_completo.sql
"@

$restoreScript | Out-File -FilePath "$diretorioBackup\restaurar_backup.sql" -Encoding UTF8

Write-Host "Backup completo finalizado!" -ForegroundColor Green
Write-Host "Arquivos salvos em: $diretorioBackup" -ForegroundColor Yellow
Write-Host "Resumo disponível em: $resumoPath" -ForegroundColor Yellow
Write-Host "Script de restauração criado: restaurar_backup.sql" -ForegroundColor Yellow

# Listar arquivos criados
Write-Host "`nArquivos criados:" -ForegroundColor Cyan
Get-ChildItem -Path $diretorioBackup -Name | ForEach-Object { Write-Host "  - $_" }