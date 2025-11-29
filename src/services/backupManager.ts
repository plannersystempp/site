import { supabase } from '@/integrations/supabase/client';
import { backupService, BackupData } from '@/services/backupService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm format
  enabled: boolean;
  options: {
    fullBackup: boolean;
    validateData: boolean;
    compress: boolean;
    retentionDays: number;
  };
  lastRun?: string;
  nextRun?: string;
}

export interface BackupStorage {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  config: Record<string, any>;
  enabled: boolean;
  lastBackup?: string;
}

export class BackupManager {
  private static instance: BackupManager;
  private schedules: BackupSchedule[] = [];
  private storage: BackupStorage[] = [];
  private backupHistory: BackupData[] = [];

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  constructor() {
    this.loadSchedules();
    this.loadStorage();
    this.startScheduler();
  }

  // Gerenciamento de Agendamentos
  async createSchedule(schedule: Omit<BackupSchedule, 'id'>): Promise<BackupSchedule> {
    const newSchedule: BackupSchedule = {
      ...schedule,
      id: this.generateId(),
      nextRun: this.calculateNextRun(schedule.frequency, schedule.time)
    };

    this.schedules.push(newSchedule);
    await this.saveSchedules();
    
    // Registrar no banco de dados
    await this.logScheduleActivity('created', newSchedule);
    
    return newSchedule;
  }

  async updateSchedule(id: string, updates: Partial<BackupSchedule>): Promise<BackupSchedule | null> {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index === -1) return null;

    const updatedSchedule = {
      ...this.schedules[index],
      ...updates,
      nextRun: updates.frequency || updates.time ? 
        this.calculateNextRun(updates.frequency || this.schedules[index].frequency, 
                            updates.time || this.schedules[index].time) : 
        this.schedules[index].nextRun
    };

    this.schedules[index] = updatedSchedule;
    await this.saveSchedules();
    await this.logScheduleActivity('updated', updatedSchedule);
    
    return updatedSchedule;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index === -1) return false;

    const schedule = this.schedules[index];
    this.schedules.splice(index, 1);
    await this.saveSchedules();
    await this.logScheduleActivity('deleted', schedule);
    
    return true;
  }

  getSchedules(): BackupSchedule[] {
    return [...this.schedules];
  }

  // Gerenciamento de Storage
  async addStorage(storage: Omit<BackupStorage, 'id'>): Promise<BackupStorage> {
    const newStorage: BackupStorage = {
      ...storage,
      id: this.generateId()
    };

    this.storage.push(newStorage);
    await this.saveStorage();
    await this.logStorageActivity('added', newStorage);
    
    return newStorage;
  }

  getStorage(): BackupStorage[] {
    return [...this.storage];
  }

  // Execução de Backup Automático
  private startScheduler() {
    // Verificar agendamentos a cada minuto
    setInterval(() => {
      this.checkAndRunSchedules();
    }, 60000); // 1 minuto

    // Executar verificação inicial
    setTimeout(() => {
      this.checkAndRunSchedules();
    }, 5000); // 5 segundos após inicialização
  }

  private async checkAndRunSchedules() {
    const now = new Date();
    
    for (const schedule of this.schedules) {
      if (!schedule.enabled || !schedule.nextRun) continue;
      
      const nextRun = new Date(schedule.nextRun);
      if (now >= nextRun) {
        try {
          await this.executeScheduledBackup(schedule);
          
          // Atualizar última execução e próxima execução
          schedule.lastRun = now.toISOString();
          schedule.nextRun = this.calculateNextRun(schedule.frequency, schedule.time);
          
          await this.updateSchedule(schedule.id, {
            lastRun: schedule.lastRun,
            nextRun: schedule.nextRun
          });
          
        } catch (error: any) {
          console.error(`Erro ao executar backup agendado ${schedule.name}:`, error);
          await this.logScheduleActivity('failed', schedule, error.message);
        }
      }
    }
  }

  private async executeScheduledBackup(schedule: BackupSchedule): Promise<void> {
    console.log(`Executando backup agendado: ${schedule.name}`);
    
    // Verificar permissões
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: isSuperAdmin, error: permissionError } = await supabase.rpc('is_super_admin');
    if (permissionError || !isSuperAdmin) {
      throw new Error('Acesso negado: apenas superadmin pode fazer backup');
    }

    // Executar backup
    const result = await backupService.createBackup({
      fullBackup: schedule.options.fullBackup,
      validateData: schedule.options.validateData,
      compress: schedule.options.compress
    });

    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar backup');
    }

    if (result.backup) {
      // Adicionar ao histórico
      this.backupHistory.unshift(result.backup);
      
      // Limitar histórico
      if (this.backupHistory.length > 50) {
        this.backupHistory = this.backupHistory.slice(0, 50);
      }

      // Limpar backups antigos baseado em retenção
      await this.cleanupOldBackups(schedule.options.retentionDays);
      
      // Salvar em storage se configurado
      await this.saveToStorage(result.backup);
      
      await this.logScheduleActivity('completed', schedule);
    }
  }

  // Limpeza de Backups Antigos
  private async cleanupOldBackups(retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    // Limpar histórico local
    this.backupHistory = this.backupHistory.filter(backup => 
      new Date(backup.metadata.timestamp) >= cutoffDate
    );
    
    // Limpar backups no Supabase Storage (se configurado)
    try {
      const { data: files } = await supabase.storage
        .from('backups')
        .list('', { limit: 1000 });
      
      if (files) {
        const oldFiles = files.filter(file => {
          const fileDate = new Date(file.created_at);
          return fileDate < cutoffDate;
        });
        
        if (oldFiles.length > 0) {
          const filesToDelete = oldFiles.map(file => file.name);
          await supabase.storage.from('backups').remove(filesToDelete);
          
          console.log(`Removidos ${oldFiles.length} backups antigos`);
        }
      }
    } catch (error) {
      console.error('Erro ao limpar backups antigos:', error);
    }
  }

  // Salvamento em Storage
  private async saveToStorage(backup: BackupData): Promise<void> {
    try {
      const fileName = `backup-${format(new Date(backup.metadata.timestamp), 'yyyy-MM-dd-HH-mm-ss')}.json`;
      const fileContent = JSON.stringify(backup, null, 2);
      const fileBlob = new Blob([fileContent], { type: 'application/json' });
      
      // Tentar salvar no Supabase Storage
      const { error } = await supabase.storage
        .from('backups')
        .upload(fileName, fileBlob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Erro ao salvar backup no storage:', error);
      } else {
        console.log(`Backup salvo no storage: ${fileName}`);
      }
    } catch (error) {
      console.error('Erro ao salvar em storage:', error);
    }
  }

  // Utilitários
  private calculateNextRun(frequency: string, time: string): string {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const nextRun = new Date(now);
    
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      switch (frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
      }
    }
    
    return nextRun.toISOString();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Logging
  private async logScheduleActivity(
    action: string, 
    schedule: BackupSchedule, 
    error?: string
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: 'system',
        action: `backup_schedule_${action}`,
        table_name: 'backup_schedules',
        new_values: {
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          error: error
        },
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Erro ao registrar log de agendamento:', logError);
    }
  }

  private async logStorageActivity(
    action: string, 
    storage: BackupStorage
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: 'system',
        action: `backup_storage_${action}`,
        table_name: 'backup_storage',
        new_values: {
          storageId: storage.id,
          storageName: storage.name,
          storageType: storage.type
        },
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Erro ao registrar log de storage:', logError);
    }
  }

  // Persistência Local (com fallback)
  private async loadSchedules(): Promise<void> {
    try {
      // Tentar carregar do localStorage primeiro
      const saved = localStorage.getItem('backup_schedules');
      if (saved) {
        this.schedules = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      this.schedules = [];
    }
  }

  private async saveSchedules(): Promise<void> {
    try {
      localStorage.setItem('backup_schedules', JSON.stringify(this.schedules));
    } catch (error) {
      console.error('Erro ao salvar agendamentos:', error);
    }
  }

  private async loadStorage(): Promise<void> {
    try {
      const saved = localStorage.getItem('backup_storage');
      if (saved) {
        this.storage = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar storage:', error);
      this.storage = [];
    }
  }

  private async saveStorage(): Promise<void> {
    try {
      localStorage.setItem('backup_storage', JSON.stringify(this.storage));
    } catch (error) {
      console.error('Erro ao salvar storage:', error);
    }
  }

  // Métodos de Recuperação
  getBackupHistory(): BackupData[] {
    return [...this.backupHistory];
  }

  async getSystemBackupStatus(): Promise<{
    totalBackups: number;
    lastBackup: string | null;
    schedulesActive: number;
    storageConfigured: number;
    estimatedNextBackup: string | null;
  }> {
    const activeSchedules = this.schedules.filter(s => s.enabled);
    const nextBackup = activeSchedules.length > 0 ? 
      Math.min(...activeSchedules.map(s => new Date(s.nextRun || 0).getTime())) : null;

    return {
      totalBackups: this.backupHistory.length,
      lastBackup: this.backupHistory[0]?.metadata.timestamp || null,
      schedulesActive: activeSchedules.length,
      storageConfigured: this.storage.filter(s => s.enabled).length,
      estimatedNextBackup: nextBackup ? new Date(nextBackup).toISOString() : null
    };
  }
}

export const backupManager = BackupManager.getInstance();