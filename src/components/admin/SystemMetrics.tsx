// FASE 7: Métricas e Monitoramento do Sistema
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Database, Activity, HardDrive, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TableSize {
  table_name: string;
  size_pretty: string;
  row_count: number;
  size_bytes: number;
}

export const SystemMetrics: React.FC = () => {
  const [tableSizes, setTableSizes] = useState<TableSize[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Buscar tamanhos das tabelas
      const { data: sizes, error } = await supabase.rpc('get_table_sizes' as any);

      if (error) {
        console.error('Error fetching table sizes:', error);
        // Fallback: buscar dados básicos
        const tables = [
          'events', 'personnel', 'personnel_allocations', 'work_records',
          'audit_logs', 'payroll_closings', 'absences', 'event_payroll',
          'teams', 'team_members', 'user_profiles', 'notifications'
        ];

        const counts = await Promise.all(
          tables.map(async (table) => {
            const { count } = await supabase
              .from(table as any)
              .select('*', { count: 'exact', head: true });
            return { table_name: table, row_count: count || 0, size_pretty: '-', size_bytes: 0 };
          })
        );

        setTableSizes(counts);
      } else {
        setTableSizes(sizes || []);
      }
    } catch (error) {
      console.error('Error in fetchMetrics:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar métricas do sistema',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getSizeColor = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb > 100) return 'text-red-600';
    if (mb > 50) return 'text-orange-600';
    if (mb > 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const totalSize = tableSizes.reduce((sum, t) => sum + t.size_bytes, 0);
  const totalRows = tableSizes.reduce((sum, t) => sum + t.row_count, 0);
  const largeTables = tableSizes.filter(t => t.size_bytes > 5 * 1024 * 1024); // > 5MB

  return (
    <div className="space-y-4">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Tamanho Total do Banco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalSize / (1024 * 1024)).toFixed(2)} MB
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tableSizes.length} tabelas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              Total de Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRows.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os dados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Tabelas Grandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{largeTables.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Maiores que 5 MB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Métricas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Métricas por Tabela
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">Carregando métricas...</div>
            ) : tableSizes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma métrica disponível
              </div>
            ) : (
              <div className="space-y-2">
                {tableSizes
                  .sort((a, b) => b.size_bytes - a.size_bytes)
                  .map((table) => (
                    <div
                      key={table.table_name}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{table.table_name}</span>
                          {table.size_bytes > 5 * 1024 * 1024 && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              Grande
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {table.row_count.toLocaleString('pt-BR')} registros
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${getSizeColor(table.size_bytes)}`}>
                        {table.size_pretty || `${(table.size_bytes / 1024).toFixed(2)} KB`}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {largeTables.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">
                    Atenção: {largeTables.length} tabela(s) grande(s) detectada(s)
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Considere arquivar dados antigos para otimizar performance: {largeTables.map(t => t.table_name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
