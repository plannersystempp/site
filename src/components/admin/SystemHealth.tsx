
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: Date;
}

export const SystemHealth: React.FC = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const runHealthChecks = async () => {
    setChecking(true);
    const checks: HealthCheck[] = [];

    try {
      // Check database connection
      const { error: dbError } = await supabase.from('events').select('count', { count: 'exact' }).limit(1);
      checks.push({
        name: 'Conexão com Banco de Dados',
        status: dbError ? 'error' : 'healthy',
        message: dbError ? 'Falha na conexão' : 'Conectado com sucesso',
        lastChecked: new Date()
      });

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      checks.push({
        name: 'Sistema de Autenticação',
        status: authError ? 'error' : user ? 'healthy' : 'warning',
        message: authError ? 'Erro na autenticação' : user ? 'Usuário autenticado' : 'Usuário não encontrado',
        lastChecked: new Date()
      });

      // Check data integrity
      const { data: orphanedRecords } = await supabase
        .from('personnel_allocations')
        .select('id')
        .is('event_id', null);
      
      checks.push({
        name: 'Integridade dos Dados',
        status: (orphanedRecords && orphanedRecords.length > 0) ? 'warning' : 'healthy',
        message: orphanedRecords && orphanedRecords.length > 0 
          ? `${orphanedRecords.length} registros órfãos encontrados` 
          : 'Todos os dados estão íntegros',
        lastChecked: new Date()
      });

      setHealthChecks(checks);
    } catch (error) {
      console.error('Error running health checks:', error);
      toast({
        title: "Erro",
        description: "Falha ao executar verificações de saúde do sistema",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Saúde do Sistema
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthChecks}
            disabled={checking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Verificar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {healthChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <div className="font-medium">{check.name}</div>
                  <div className="text-sm text-muted-foreground">{check.message}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(check.status)}>
                  {check.status === 'healthy' ? 'Saudável' : 
                   check.status === 'warning' ? 'Atenção' : 'Erro'}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {check.lastChecked.toLocaleTimeString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
