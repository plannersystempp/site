import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  sectionName?: string;
}

const DashboardFallback = ({ sectionName }: { sectionName?: string }) => (
  <Card className="border-destructive/20 bg-destructive/5">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <CardTitle className="text-base">
          Erro no {sectionName || 'Dashboard'}
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">
        Não foi possível carregar esta seção do dashboard. Os dados podem estar temporariamente indisponíveis.
      </p>
      <Button 
        onClick={() => window.location.reload()} 
        variant="outline" 
        size="sm"
        className="w-full"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Recarregar Dashboard
      </Button>
    </CardContent>
  </Card>
);

export const DashboardErrorBoundary: React.FC<DashboardErrorBoundaryProps> = ({ 
  children, 
  sectionName 
}) => {
  const handleDashboardError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log específico para erros do dashboard
    console.group('🏠 Dashboard Error');
    console.error('Section:', sectionName || 'Unknown');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Aqui você pode adicionar métricas específicas do dashboard
    // Por exemplo, rastrear quais seções falham mais frequentemente
  };

  return (
    <ErrorBoundary
      level="section"
      name={`Dashboard-${sectionName || 'Unknown'}`}
      fallback={<DashboardFallback sectionName={sectionName} />}
      onError={handleDashboardError}
    >
      {children}
    </ErrorBoundary>
  );
};

// Wrapper específico para KPIs
export const KPIErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardErrorBoundary sectionName="KPIs">
    {children}
  </DashboardErrorBoundary>
);

// Wrapper específico para gráficos
export const ChartErrorBoundary: React.FC<{ children: React.ReactNode; chartName?: string }> = ({ 
  children, 
  chartName 
}) => {
  const ChartFallback = () => (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground text-center mb-4">
          Erro ao carregar {chartName || 'gráfico'}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary
      level="component"
      name={`Chart-${chartName || 'Unknown'}`}
      fallback={<ChartFallback />}
    >
      {children}
    </ErrorBoundary>
  );
};