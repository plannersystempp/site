import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Download, 
  Trash2, 
  RefreshCw,
  Bug,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useErrorReporting } from '@/services/errorReporting';
import type { ErrorMetrics, ErrorReport } from '@/services/errorReporting';

export const ErrorDashboard: React.FC = () => {
  const { getMetrics, clearErrors, exportErrors } = useErrorReporting();
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load error metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearErrors = async () => {
    if (confirm('Tem certeza que deseja limpar todos os relatórios de erro?')) {
      clearErrors();
      await loadMetrics();
    }
  };

  const handleExportErrors = () => {
    const data = exportErrors();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'page': return 'destructive';
      case 'section': return 'secondary';
      case 'component': return 'outline';
      default: return 'outline';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'page': return <AlertTriangle className="w-4 h-4" />;
      case 'section': return <AlertCircle className="w-4 h-4" />;
      case 'component': return <Bug className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Carregando métricas de erro...
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar as métricas de erro.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Erros</h1>
          <p className="text-muted-foreground">
            Monitoramento e análise de erros da aplicação
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExportErrors} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            onClick={handleClearErrors} 
            variant="destructive" 
            size="sm"
            disabled={metrics.totalErrors === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Tudo
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Erros registrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.criticalErrors.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Erros de nível página
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Componentes Afetados</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(metrics.errorsByComponent).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Componentes com erros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Erro</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(metrics.errorsByType).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tipos diferentes de erro
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalhes */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Erros Recentes</TabsTrigger>
          <TabsTrigger value="critical">Erros Críticos</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Erros Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {metrics.recentErrors.map((error) => (
                    <div
                      key={error.id}
                      className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedError(error)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getLevelIcon(error.level)}
                          <div>
                            <p className="font-medium text-sm">{error.component}</p>
                            <p className="text-xs text-muted-foreground">
                              {error.error.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getLevelColor(error.level) as any}>
                            {error.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {metrics.recentErrors.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                      <p>Nenhum erro recente encontrado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Erros Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {metrics.criticalErrors.map((error) => (
                    <div
                      key={error.id}
                      className="border border-destructive/20 bg-destructive/5 rounded-lg p-3 hover:bg-destructive/10 cursor-pointer"
                      onClick={() => setSelectedError(error)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <div>
                            <p className="font-medium text-sm">{error.component}</p>
                            <p className="text-xs text-muted-foreground">
                              {error.error.message}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {metrics.criticalErrors.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>Nenhum erro crítico encontrado! 🎉</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Erros por Nível</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.errorsByLevel).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getLevelIcon(level)}
                        <span className="capitalize">{level}</span>
                      </div>
                      <Badge variant={getLevelColor(level) as any}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Componentes com Mais Erros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.errorsByComponent)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([component, count]) => (
                      <div key={component} className="flex items-center justify-between">
                        <span className="text-sm font-mono">{component}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes do Erro */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes do Erro</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedError(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">ID do Erro</label>
                      <p className="text-sm font-mono bg-muted p-2 rounded">
                        {selectedError.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Timestamp</label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {new Date(selectedError.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Componente</label>
                    <p className="text-sm bg-muted p-2 rounded">
                      {selectedError.component}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Mensagem do Erro</label>
                    <p className="text-sm bg-muted p-2 rounded">
                      {selectedError.error.message}
                    </p>
                  </div>

                  {selectedError.error.stack && (
                    <div>
                      <label className="text-sm font-medium">Stack Trace</label>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {selectedError.error.stack}
                      </pre>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Contexto</label>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(selectedError.context, null, 2)}
                    </pre>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};