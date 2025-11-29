import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Download, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Settings,
  History,
  Shield,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  backupService, 
  BackupData, 
  BackupOptions,
  BackupResult 
} from '@/services/backupService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DatabaseBackupTab() {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<BackupData | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    fullBackup: true,
    validateData: true,
    compress: false,
    includeStorage: false
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [backupProgress, setBackupProgress] = useState<{
    currentTable: string;
    completed: number;
    total: number;
  } | null>(null);
  
  const { toast } = useToast();

  const handleBackup = useCallback(async (useEdgeFunction = false) => {
    setLoading(true);
    setError(null);
    setWarnings([]);
    setBackupProgress(null);

    try {
      let result: BackupResult;

      if (useEdgeFunction) {
        // Tentar usar a função Edge primeiro
        result = await createEdgeBackup();
      } else {
        // Usar o serviço local melhorado
        result = await backupService.createBackup(backupOptions);
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar backup');
      }

      if (result.backup) {
        setLastBackup(result.backup);
        setBackupHistory(prev => [result.backup!, ...prev.slice(0, 9)]); // Manter últimos 10
        
        // Validar backup se solicitado
        if (backupOptions.validateData) {
          const validation = await backupService.validateBackup(result.backup);
          if (!validation.valid) {
            setWarnings(prev => [...prev, ...validation.errors]);
          }
        }

        toast({
          title: "✅ Backup criado com sucesso!",
          description: backupService.formatBackupInfo(result.backup),
        });

        if (result.warnings && result.warnings.length > 0) {
          setWarnings(result.warnings);
          toast({
            title: "⚠️ Avisos durante o backup",
            description: `${result.warnings.length} aviso(s) encontrado(s)`,
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
      setError(error.message || 'Erro ao criar backup');
      
      toast({
        title: "❌ Erro ao criar backup",
        description: error.message || 'Erro ao criar backup',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setBackupProgress(null);
    }
  }, [backupOptions, toast]);

  const createEdgeBackup = async (): Promise<BackupResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('database-backup', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: backupOptions,
      });

      if (error) {
        if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
          throw new Error('Erro de conexão com o servidor de backup. Usando método local...');
        }
        throw new Error(error.message || 'Erro ao criar backup via Edge Function');
      }

      return data as BackupResult;
    } catch (error: any) {
      console.error('Erro na Edge Function, tentando método local:', error);
      // Fallback para método local
      return await backupService.createBackup(backupOptions);
    }
  };

  const downloadBackup = useCallback((backup: BackupData) => {
    try {
      const backupJson = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-plannersystem-${format(new Date(backup.metadata.timestamp), 'yyyy-MM-dd-HH-mm-ss')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "📥 Download iniciado!",
        description: "O backup está sendo baixado para o seu computador.",
      });
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast({
        title: "❌ Erro ao fazer download",
        description: "Erro ao baixar o arquivo de backup",
        variant: "destructive",
      });
    }
  }, [toast]);

  const validateCurrentBackup = useCallback(async () => {
    if (!lastBackup) return;

    try {
      const validation = await backupService.validateBackup(lastBackup);
      if (validation.valid) {
        toast({
          title: "✅ Backup válido!",
          description: "A integridade do backup foi verificada com sucesso.",
        });
      } else {
        setWarnings(validation.errors);
        toast({
          title: "⚠️ Problemas encontrados",
          description: `${validation.errors.length} erro(s) encontrado(s)`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro na validação",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [lastBackup, toast]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBackupStatus = (backup: BackupData) => {
    const successRate = (backup.metadata.successfulTables / backup.metadata.totalTables) * 100;
    if (successRate === 100) return { color: 'text-green-600', bg: 'bg-green-50', label: 'Sucesso' };
    if (successRate >= 80) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Parcial' };
    return { color: 'text-red-600', bg: 'bg-red-50', label: 'Falhou' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup do Banco de Dados
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Opções
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Opções de Backup</DialogTitle>
                    <DialogDescription>
                      Configure as opções avançadas do backup
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="full-backup">Backup Completo</Label>
                      <Switch
                        id="full-backup"
                        checked={backupOptions.fullBackup}
                        onCheckedChange={(checked) => 
                          setBackupOptions(prev => ({ ...prev, fullBackup: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="validate-data">Validar Dados</Label>
                      <Switch
                        id="validate-data"
                        checked={backupOptions.validateData}
                        onCheckedChange={(checked) => 
                          setBackupOptions(prev => ({ ...prev, validateData: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compress">Comprimir Dados</Label>
                      <Switch
                        id="compress"
                        checked={backupOptions.compress}
                        onCheckedChange={(checked) => 
                          setBackupOptions(prev => ({ ...prev, compress: checked }))
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">Backup via Servidor</p>
                <p className="text-xs text-muted-foreground">
                  Usa Edge Function (mais rápido)
                </p>
              </div>
              <Button 
                onClick={() => handleBackup(true)}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Backup Servidor
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">Backup Local</p>
                <p className="text-xs text-muted-foreground">
                  Processamento no navegador
                </p>
              </div>
              <Button 
                onClick={() => handleBackup(false)}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Backup Local
                  </>
                )}
              </Button>
            </div>
          </div>

          {backupProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando: {backupProgress.currentTable}</span>
                <span>{backupProgress.completed}/{backupProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(backupProgress.completed / backupProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Avisos durante o backup:</p>
                  {warnings.map((warning, index) => (
                    <p key={index} className="text-sm">• {warning}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {lastBackup && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Último Backup Realizado
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={validateCurrentBackup}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Validar
                    </Button>
                    <Button 
                      onClick={() => downloadBackup(lastBackup)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Baixar
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Data/Hora</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(lastBackup.metadata.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tabelas</p>
                    <Badge variant="outline" className="text-xs">
                      {lastBackup.metadata.successfulTables}/{lastBackup.metadata.totalTables}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tamanho</p>
                    <p className="text-sm font-medium">{formatFileSize(lastBackup.metadata.databaseSize)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Duração</p>
                    <p className="text-sm font-medium">{Math.round(lastBackup.metadata.duration / 1000)}s</p>
                  </div>
                </div>

                {lastBackup.metadata.failedTables > 0 && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {lastBackup.metadata.failedTables} tabela(s) falharam durante o backup
                    </AlertDescription>
                  </Alert>
                )}

                {lastBackup.checksum && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Checksum: {lastBackup.checksum}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {backupHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Histórico de Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {backupHistory.map((backup, index) => {
                  const status = getBackupStatus(backup);
                  return (
                    <div key={index} className={`p-3 rounded-lg border ${status.bg}`}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {format(new Date(backup.metadata.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {backupService.formatBackupInfo(backup)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={status.color} variant="outline">
                            {status.label}
                          </Badge>
                          <Button
                            onClick={() => downloadBackup(backup)}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas e Informações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Segurança do Backup</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Validação de integridade dos dados</li>
                <li>• Checksum para verificação</li>
                <li>• Registro em audit_logs</li>
                <li>• Permissões de superadmin verificadas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Performance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Processamento em chunks de 1000 registros</li>
                <li>• Retry automático em caso de falha</li>
                <li>• Backup incremental disponível</li>
                <li>• Compressão opcional de dados</li>
              </ul>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Este backup não inclui arquivos de mídia (fotos, documentos) 
              armazenados no storage. Para backup completo, considere também exportar os arquivos do storage.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}