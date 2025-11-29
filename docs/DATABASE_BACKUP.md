# Funcionalidade de Backup do Banco de Dados

## Visão Geral

A funcionalidade de backup do banco de dados permite que superadministradores criem backups completos de todos os dados do sistema PlannerSystem. O backup inclui todas as tabelas do banco de dados, metadados e informações de auditoria.

## Acesso

Apenas usuários com papel de `superadmin` podem acessar esta funcionalidade. O backup está disponível no painel de administração em uma aba dedicada.

## Como Usar

### 1. Acessar o Painel SuperAdmin
- Faça login como superadmin
- Navegue até o painel de administração
- Clique na aba "Backup BD" (ou encontre no menu "Mais" no mobile)

### 2. Criar um Backup
- Clique no botão "Criar Backup"
- Aguarde o processamento (o tempo varia conforme o tamanho do banco)
- O backup será criado com informações detalhadas sobre o processo

### 3. Baixar o Backup
- Após criar o backup, clique em "Baixar Backup"
- O arquivo JSON será baixado automaticamente com timestamp
- O nome do arquivo segue o padrão: `backup-plannersystem-YYYY-MM-DD-HH-mm-ss.json`

### 4. Copiar JSON
- Alternativamente, você pode copiar o JSON diretamente para a área de transferência
- Útil para análise rápida ou compartilhamento

## Estrutura do Backup

O backup contém:

```json
{
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "userId": "uuid-do-usuario",
    "userEmail": "admin@example.com",
    "totalTables": 25,
    "successfulTables": 24,
    "failedTables": 1,
    "databaseSize": 1048576
  },
  "data": {
    "users": {
      "data": [...],
      "count": 150,
      "timestamp": "2024-01-01T12:00:00.000Z"
    },
    "teams": {
      "data": [...],
      "count": 10,
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
    // ... outras tabelas
  },
  "version": "1.0",
  "format": "planner-system-backup"
}
```

## Segurança

- **Autenticação**: Apenas superadmin podem criar backups
- **Auditoria**: Todos os backups são registrados nos logs de auditoria
- **Privacidade**: Os backups contêm dados sensíveis e devem ser armazenados com segurança

## Recomendações

1. **Frequência**: Faça backups semanalmente ou mensalmente
2. **Armazenamento**: Mantenha backups por pelo menos 90 dias
3. **Teste**: Teste periodicamente a restauração dos dados
4. **Segurança**: Armazene os backups em local seguro e criptografado

## Limitações

- **Storage**: Esta funcionalidade não faz backup de arquivos de mídia (fotos, documentos) armazenados no storage
- **Tamanho**: Para bancos muito grandes, considere fazer backups incrementais
- **Performance**: O backup pode afetar a performance do sistema durante a execução

## Suporte

Em caso de problemas com o backup ou restauração, entre em contato com o suporte técnico fornecendo:
- ID do backup (timestamp)
- Erro específico (se houver)
- Tamanho aproximado do banco de dados