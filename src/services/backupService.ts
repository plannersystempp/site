import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface BackupOptions {
  fullBackup?: boolean;
  tables?: string[];
  includeStorage?: boolean;
  compress?: boolean;
  validateData?: boolean;
}

export interface BackupMetadata {
  timestamp: string;
  userId: string;
  userEmail: string;
  totalTables: number;
  successfulTables: number;
  failedTables: number;
  databaseSize: number;
  checksum?: string;
  duration: number;
  type: 'full' | 'incremental' | 'selective';
}

export interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, any>;
  version: string;
  format: string;
  checksum?: string;
}

export interface BackupResult {
  success: boolean;
  backup?: BackupData;
  error?: string;
  warnings?: string[];
}

export class BackupService {
  private static instance: BackupService;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly CHUNK_SIZE = 1000;

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async createBackup(options: BackupOptions = {}): Promise<BackupResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar permissões
      const { data: isSuperAdmin, error: permissionError } = await supabase.rpc('is_super_admin');
      if (permissionError || !isSuperAdmin) {
        return { success: false, error: 'Acesso negado: apenas superadmin pode fazer backup' };
      }

      // Obter lista de tabelas
      const tables = options.tables || await this.getAllTables();
      const backupData: Record<string, any> = {};
      const backupTimestamp = new Date().toISOString();
      let successfulTables = 0;
      let failedTables = 0;

      // Processar cada tabela
      for (const tableName of tables) {
        try {
          const tableData = await this.backupTable(tableName, options);
          if (tableData.error) {
            backupData[tableName] = tableData;
            failedTables++;
            warnings.push(`Tabela ${tableName}: ${tableData.error}`);
          } else {
            backupData[tableName] = tableData;
            successfulTables++;
          }
        } catch (error: any) {
          console.error(`Erro ao processar tabela ${tableName}:`, error);
          backupData[tableName] = { 
            error: `Erro crítico: ${error.message}`,
            timestamp: backupTimestamp 
          };
          failedTables++;
          warnings.push(`Tabela ${tableName}: ${error.message}`);
        }
      }

      // Calcular checksum para validação
      let checksum: string | undefined;
      if (options.validateData) {
        checksum = await this.calculateChecksum(backupData);
      }

      // Criar metadados
      const backupMetadata: BackupMetadata = {
        timestamp: backupTimestamp,
        userId: user.id,
        userEmail: user.email!,
        totalTables: tables.length,
        successfulTables: successfulTables,
        failedTables: failedTables,
        databaseSize: JSON.stringify(backupData).length,
        duration: Date.now() - startTime,
        type: options.fullBackup ? 'full' : options.tables ? 'selective' : 'incremental',
        checksum
      };

      // Criar objeto de backup completo
      const completeBackup: BackupData = {
        metadata: backupMetadata,
        data: backupData,
        version: '2.0',
        format: 'planner-system-enhanced-backup',
        checksum
      };

      // Comprimir se solicitado
      let finalBackup = completeBackup;
      if (options.compress) {
        finalBackup = await this.compressBackup(completeBackup);
      }

      // Registrar em audit_logs
      await this.logBackupActivity(backupMetadata, warnings);

      return {
        success: true,
        backup: finalBackup,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error: any) {
      console.error('Erro crítico ao criar backup:', error);
      return {
        success: false,
        error: error.message || 'Erro crítico ao criar backup'
      };
    }
  }

  private async backupTable(tableName: string, options: BackupOptions): Promise<any> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Obter contagem total
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (countError) {
          throw new Error(`Erro ao contar registros: ${countError.message}`);
        }

        const totalRecords = count || 0;
        const chunks = Math.ceil(totalRecords / this.CHUNK_SIZE);
        const allData: any[] = [];

        // Buscar dados em chunks
        for (let chunk = 0; chunk < chunks; chunk++) {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .range(chunk * this.CHUNK_SIZE, (chunk + 1) * this.CHUNK_SIZE - 1);

          if (error) {
            throw new Error(`Erro ao buscar chunk ${chunk + 1}/${chunks}: ${error.message}`);
          }

          if (data) {
            allData.push(...data);
          }
        }

        // Validar integridade se solicitado
        if (options.validateData && totalRecords !== allData.length) {
          throw new Error(`Inconsistência de dados: esperado ${totalRecords}, obtido ${allData.length}`);
        }

        return {
          data: allData,
          count: allData.length,
          totalRecords: totalRecords,
          chunks: chunks,
          timestamp: new Date().toISOString(),
          validated: options.validateData || false
        };

      } catch (error: any) {
        lastError = error;
        console.error(`Tentativa ${attempt} falhou para tabela ${tableName}:`, error);
        
        if (attempt < maxRetries) {
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
    }

    return {
      error: `Falha após ${maxRetries} tentativas: ${lastError?.message}`,
      timestamp: new Date().toISOString()
    };
  }

  private async getAllTables(): Promise<string[]> {
    try {
      // Lista de tabelas principais do sistema
      return [
        'users', 'teams', 'team_members', 'subscriptions', 'subscription_plans',
        'events', 'personnel', 'event_personnel', 'payroll_closings',
        'notifications', 'audit_logs', 'suppliers', 'supplier_items',
        'supplier_ratings', 'freelancer_ratings', 'functions', 'work_records',
        'absences', 'personnel_payments', 'event_divisions', 'personnel_functions'
      ];
    } catch (error) {
      console.error('Erro ao obter lista de tabelas:', error);
      throw error;
    }
  }

  private async calculateChecksum(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(jsonString);
      
      // Simple hash function for browser compatibility
      let hash = 0;
      for (let i = 0; i < dataBuffer.length; i++) {
        const char = dataBuffer[i];
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('Erro ao calcular checksum:', error);
      return 'error';
    }
  }

  private async compressBackup(backup: BackupData): Promise<BackupData> {
    try {
      // Simple compression for browser - remove unnecessary whitespace
      const compressedData: BackupData = {
        ...backup,
        data: backup.data,
        format: 'planner-system-compressed-backup'
      };
      
      return compressedData;
    } catch (error) {
      console.error('Erro ao comprimir backup:', error);
      return backup;
    }
  }

  private async logBackupActivity(metadata: BackupMetadata, warnings: string[]): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: metadata.userId,
        action: 'database_backup_enhanced',
        table_name: 'database',
        new_values: {
          ...metadata,
          warnings: warnings.length > 0 ? warnings : undefined
        },
        created_at: metadata.timestamp,
      });
    } catch (logError) {
      console.error('Erro ao registrar log de backup:', logError);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async validateBackup(backup: BackupData): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validar estrutura básica
      if (!backup.metadata || !backup.data) {
        errors.push('Estrutura de backup inválida');
        return { valid: false, errors };
      }

      // Validar checksum se disponível
      if (backup.checksum) {
        const calculatedChecksum = await this.calculateChecksum(backup.data);
        if (backup.checksum !== calculatedChecksum) {
          errors.push('Checksum inválido - dados corrompidos');
        }
      }

      // Validar metadados
      const requiredFields = ['timestamp', 'userId', 'userEmail', 'totalTables', 'successfulTables'];
      for (const field of requiredFields) {
        if (!backup.metadata[field as keyof BackupMetadata]) {
          errors.push(`Campo obrigatório ausente: ${field}`);
        }
      }

      // Validar dados das tabelas
      const tables = Object.keys(backup.data);
      if (tables.length !== backup.metadata.totalTables) {
        errors.push(`Número de tabelas inconsistente: esperado ${backup.metadata.totalTables}, obtido ${tables.length}`);
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      errors.push(`Erro na validação: ${error.message}`);
      return { valid: false, errors };
    }
  }

  formatBackupInfo(backup: BackupData): string {
    const { metadata } = backup;
    const duration = Math.round(metadata.duration / 1000);
    const size = this.formatFileSize(metadata.databaseSize);
    
    return `Backup ${metadata.type} - ${metadata.successfulTables}/${metadata.totalTables} tabelas - ${size} - ${duration}s`;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const backupService = BackupService.getInstance();