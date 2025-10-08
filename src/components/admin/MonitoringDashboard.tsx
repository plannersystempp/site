import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonitoringReport {
  orphan_count: number;
  pending_setups: number;
  details: any[];
  timestamp: string;
}

export const MonitoringDashboard: React.FC = () => {
  const { toast } = useToast();
  const [report, setReport] = useState<MonitoringReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runMonitoring = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_and_report_orphan_users');

      if (error) {
        console.error('Error running monitoring:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao executar monitoramento',
          variant: 'destructive',
        });
        return;
      }

      const monitoringData = data as unknown as MonitoringReport;
      setReport(monitoringData);
      setLastCheck(new Date());

      if (monitoringData.orphan_count > 0) {
        toast({
          title: 'Usuários órfãos detectados',
          description: `${monitoringData.orphan_count} usuário(s) órfão(s) encontrado(s)`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sistema saudável',
          description: 'Nenhum usuário órfão detectado',
        });
      }
    } catch (error) {
      console.error('Error running monitoring:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao executar monitoramento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runAutoFix = async () => {
    setAutoFixing(true);
    try {
      const { data, error } = await supabase.rpc('auto_fix_simple_orphans');

      if (error) {
        console.error('Error running auto-fix:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao executar correção automática',
          variant: 'destructive',
        });
        return;
      }

      const result = data as unknown as { fixed_count: number };

      toast({
        title: 'Correção automática concluída',
        description: `${result.fixed_count} usuário(s) corrigido(s) automaticamente`,
      });

      // Re-run monitoring to get updated stats
      runMonitoring();
    } catch (error) {
      console.error('Error running auto-fix:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao executar correção automática',
        variant: 'destructive',
      });
    } finally {
      setAutoFixing(false);
    }
  };

  useEffect(() => {
    runMonitoring();
    // Run monitoring every 5 minutes
    const interval = setInterval(runMonitoring, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    if (!report) return { color: 'gray', label: 'Aguardando...', icon: Activity };

    const totalIssues = report.orphan_count + report.pending_setups;

    if (totalIssues === 0) {
      return { color: 'green', label: 'Saudável', icon: CheckCircle };
    } else if (totalIssues <= 5) {
      return { color: 'yellow', label: 'Atenção', icon: AlertTriangle };
    } else {
      return { color: 'red', label: 'Crítico', icon: AlertTriangle };
    }
  };

  const healthStatus = getHealthStatus();
  const StatusIcon = healthStatus.icon;

  return (
    <div className="space-y-6">
      {/* Health Status Card */}
      <Card className={`border-${healthStatus.color}-500`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 text-${healthStatus.color}-600`} />
              Status do Sistema: {healthStatus.label}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={runAutoFix} disabled={autoFixing || loading}>
                {autoFixing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Auto-Corrigir
              </Button>
              <Button variant="outline" size="sm" onClick={runMonitoring} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Verificar Agora
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lastCheck && (
            <p className="text-sm text-muted-foreground mb-4">
              Última verificação: {format(lastCheck, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          )}

          {report && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">Usuários Órfãos</div>
                  <div className={`text-3xl font-bold text-${report.orphan_count > 0 ? 'red' : 'green'}-600`}>
                    {report.orphan_count}
                  </div>
                </div>
                <AlertTriangle className={`h-8 w-8 text-${report.orphan_count > 0 ? 'red' : 'green'}-600`} />
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">Setups Pendentes</div>
                  <div className={`text-3xl font-bold text-${report.pending_setups > 0 ? 'yellow' : 'green'}-600`}>
                    {report.pending_setups}
                  </div>
                </div>
                <Activity className={`h-8 w-8 text-${report.pending_setups > 0 ? 'yellow' : 'green'}-600`} />
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">ℹ️ Monitoramento Automático</h4>
            <p className="text-sm text-muted-foreground">
              O sistema verifica automaticamente a cada 5 minutos por usuários órfãos e setups pendentes. Você receberá
              notificações quando problemas forem detectados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
