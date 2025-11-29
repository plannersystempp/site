import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Clock, 
  Database, 
  History, 
  AlertCircle, 
  CheckCircle,
  Play,
  Pause,
  Trash2,
  Plus,
  Calendar,
  HardDrive
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { backupManager, BackupSchedule, BackupStorage } from '@/services/backupManager';
import { backupService } from '@/services/backupService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BackupDashboard() {
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [storage, setStorage] = useState<BackupStorage[]>([]);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '02:00',
    enabled: true,
    options: {
      fullBackup: true,
      validateData: true,
      compress: false,
      retentionDays: 30
    }
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [schedulesData, storageData, historyData, statusData] = await Promise.all([
        backupManager.getSchedules(),
        backupManager.getStorage(),
        backupManager.getBackupHistory(),
        backupManager.getSystemBackupStatus()
      ]);
      
      setSchedules(schedulesData);
      setStorage(storageData);
      setBackupHistory(historyData);
      setSystemStatus(statusData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "❌ Erro ao carregar dados",
        description: "Não foi possível carregar as informações de backup",
        variant: "destructive",
      });
    }
  };

  const createSchedule = async () => {
    if (!newSchedule.name.trim()) {
      toast({
        title: "⚠️ Nome obrigatório",
        description: "Por favor, informe um nome para o agendamento",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await backupManager.createSchedule({
        name: newSchedule.name,
        frequency: newSchedule.frequency,
        time: newSchedule.time,
        enabled: newSchedule.enabled,
        options: newSchedule.options
      });

      toast({
        title: "✅ Agendamento criado!",
        description: `Backup ${newSchedule.name} agendado com sucesso`,
      });

      setShowNewSchedule(false);
      setNewSchedule({
        name: '',
        frequency: 'daily',
        time: '02:00',
        enabled: true,
        options: {
          fullBackup: true,
          validateData: true,
          compress: false,
          retentionDays: 30
        }
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: "❌ Erro ao criar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSchedule = async (schedule: BackupSchedule) => {
    try {
      await backupManager.updateSchedule(schedule.id, {
        enabled: !schedule.enabled
      });
      
      toast({
        title: schedule.enabled ? "⏸️ Agendamento pausado" : "▶️ Agendamento ativado",
        description: `Backup ${schedule.name} ${schedule.enabled ? 'pausado' : 'ativado'}`,
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: "❌ Erro ao alterar agendamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    
    try {
      await backupManager.deleteSchedule(scheduleId);
      
      toast({
        title: "🗑️ Agendamento excluído",
        description: "O agendamento foi removido com sucesso",
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: "❌ Erro ao excluir agendamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const runBackupNow = async (schedule: BackupSchedule) => {
    try {
      setLoading(true);
      
      // Simular execução manual do backup
      const result = await backupService.createBackup({
        fullBackup: schedule.options.fullBackup,
        validateData: schedule.options.validateData,
        compress: schedule.options.compress
      });

      if (result.success) {
        toast({
          title: "✅ Backup executado!",
          description: `Backup ${schedule.name} executado com sucesso`,
        });
      } else {
        throw new Error(result.error);
      }
      
      await loadData();
    } catch (error: any) {
      toast({
        title: "❌ Erro ao executar backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScheduleStatus = (schedule: BackupSchedule) => {
    if (!schedule.enabled) return { color: 'text-gray-500', label: 'Pausado' };
    if (schedule.nextRun && new Date(schedule.nextRun) < new Date()) {
      return { color: 'text-red-500', label: 'Atrasado' };
    }
    return { color: 'text-green-500', label: 'Ativo' };
  };

  const formatNextRun = (nextRun?: string) => {
    if (!nextRun) return 'Nunca';
    return formatDistanceToNow(new Date(nextRun), { addSuffix: true, locale: ptBR });
  };

  return (
    <div className="space-y-6">
      {/* Visão Geral do Sistema */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus?.totalBackups || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStatus?.lastBackup ? 
                `Último: ${format(new Date(systemStatus.lastBackup), 'dd/MM/yyyy HH:mm', { locale: ptBR })}` : 
                'Nenhum backup realizado'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Ativos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus?.schedulesActive || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStatus?.estimatedNextBackup ? 
                `Próximo: ${formatNextRun(systemStatus.estimatedNextBackup)}` : 
                'Nenhum agendamento'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Configurado</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus?.storageConfigured || 0}</div>
            <p className="text-xs text-muted-foreground">
              Destinos de backup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">OK</div>
            <p className="text-xs text-muted-foreground">
              Sistema operacional
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas Principais */}
      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Agendamentos de Backup
                </CardTitle>
                <Dialog open={showNewSchedule} onOpenChange={setShowNewSchedule}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Agendamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Novo Agendamento</DialogTitle>
                      <DialogDescription>
                        Configure um novo agendamento automático de backup
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Agendamento</Label>
                        <Input
                          id="name"
                          value={newSchedule.name}
                          onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Backup Diário Completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequência</Label>
                        <Select
                          value={newSchedule.frequency}
                          onValueChange={(value) => setNewSchedule(prev => ({ ...prev, frequency: value as any }))}
                        >
                          <SelectTrigger id="frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Horário</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newSchedule.time}
                          onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enabled">Ativado</Label>
                        <Switch
                          id="enabled"
                          checked={newSchedule.enabled}
                          onCheckedChange={(checked) => setNewSchedule(prev => ({ ...prev, enabled: checked }))}
                        />
                      </div>
                      <Button onClick={createSchedule} disabled={loading} className="w-full">
                        {loading ? 'Criando...' : 'Criar Agendamento'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum agendamento configurado</p>
                  <p className="text-sm text-muted-foreground">Crie seu primeiro agendamento de backup</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => {
                    const status = getScheduleStatus(schedule);
                    return (
                      <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{schedule.name}</h4>
                            <Badge className={status.color} variant="outline">
                              {status.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Frequência: {schedule.frequency === 'daily' ? 'Diário' : schedule.frequency === 'weekly' ? 'Semanal' : 'Mensal'} às {schedule.time}</p>
                            <p>Próxima execução: {formatNextRun(schedule.nextRun)}</p>
                            {schedule.lastRun && (
                              <p>Última execução: {formatDistanceToNow(new Date(schedule.lastRun), { addSuffix: true, locale: ptBR })}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => runBackupNow(schedule)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Play className="h-3 w-3" />
                            Executar
                          </Button>
                          <Button
                            onClick={() => toggleSchedule(schedule)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            {schedule.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            {schedule.enabled ? 'Pausar' : 'Ativar'}
                          </Button>
                          <Button
                            onClick={() => deleteSchedule(schedule.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Backups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backupHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum backup realizado ainda</p>
                  <p className="text-sm text-muted-foreground">Os backups aparecerão aqui após serem executados</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {backupHistory.map((backup, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">
                              {format(new Date(backup.metadata.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {backupService.formatBackupInfo(backup)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {backup.metadata.successfulTables}/{backup.metadata.totalTables} tabelas
                          </Badge>
                          <Button variant="outline" size="sm">
                            <History className="h-3 w-3" />
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Configurações de Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    O backup automático é salvo no Supabase Storage. Configure as permissões e retenção de arquivos.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Storage Configurado</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>• Supabase Storage (padrão)</p>
                      <p>• Bucket: backups</p>
                      <p>• Retenção: 30 dias</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Estatísticas</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>• Backups armazenados: {backupHistory.length}</p>
                      <p>• Tamanho total: Calculando...</p>
                      <p>• Última limpeza: Hoje</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}