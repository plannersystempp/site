import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, ArrowLeft, RefreshCw, AlertTriangle, Navigation } from 'lucide-react';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
  routeName?: string;
  fallbackRoute?: string;
}

const RouteFallback = ({ 
  routeName, 
  fallbackRoute 
}: { 
  routeName?: string; 
  fallbackRoute?: string;
}) => {
  const handleNavigateHome = () => {
    window.location.href = '/app';
  };

  const handleNavigateBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleNavigateHome();
    }
  };

  const handleNavigateFallback = () => {
    if (fallbackRoute) {
      window.location.href = fallbackRoute;
    } else {
      handleNavigateHome();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 text-destructive mb-4">
            <AlertTriangle className="w-full h-full" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CardTitle className="text-xl">Página Indisponível</CardTitle>
            <Badge variant="destructive">Erro de Rota</Badge>
          </div>
          {routeName && (
            <p className="text-sm text-muted-foreground">
              Rota: <code className="bg-muted px-2 py-1 rounded">{routeName}</code>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Esta página encontrou um erro inesperado e não pode ser carregada.
            </p>
            <p className="text-sm text-muted-foreground">
              Você pode tentar navegar para outra página ou recarregar a aplicação.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={handleNavigateHome}
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Ir para Início
            </Button>
            
            <Button 
              onClick={handleNavigateBack}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            
            {fallbackRoute && (
              <Button 
                onClick={handleNavigateFallback}
                variant="secondary"
                className="flex items-center justify-center gap-2 sm:col-span-2"
              >
                <Navigation className="w-4 h-4" />
                Página Alternativa
              </Button>
            )}
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className={`flex items-center justify-center gap-2 ${fallbackRoute ? '' : 'sm:col-span-2'}`}
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">💡 Dicas para resolver:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Verifique sua conexão com a internet</li>
              <li>• Tente recarregar a página</li>
              <li>• Limpe o cache do navegador se o problema persistir</li>
              <li>• Entre em contato com o suporte se necessário</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ 
  children, 
  routeName,
  fallbackRoute
}) => {
  const handleRouteError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log específico para erros de rota
    console.group('🛣️ Route Error');
    console.error('Route:', routeName || window.location.pathname);
    console.error('Fallback Route:', fallbackRoute);
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Current URL:', window.location.href);
    console.error('Referrer:', document.referrer);
    console.groupEnd();

    // Salvar informações da rota com erro para análise
    try {
      const routeErrorData = {
        route: routeName || window.location.pathname,
        error: error.message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      };

      // Salvar no localStorage para análise posterior
      const errorKey = `route_error_${Date.now()}`;
      localStorage.setItem(errorKey, JSON.stringify(routeErrorData));
      
      // Limpar erros antigos (manter apenas os últimos 10)
      const errorKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('route_error_')
      ).sort();
      
      if (errorKeys.length > 10) {
        errorKeys.slice(0, errorKeys.length - 10).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (storageError) {
      console.error('Failed to store route error data:', storageError);
    }
  };

  return (
    <ErrorBoundary
      level="page"
      name={`Route-${routeName || 'Unknown'}`}
      fallback={<RouteFallback routeName={routeName} fallbackRoute={fallbackRoute} />}
      onError={handleRouteError}
    >
      {children}
    </ErrorBoundary>
  );
};

// Hook para analisar erros de rota salvos
export const useRouteErrorAnalytics = () => {
  const getRouteErrors = React.useCallback(() => {
    try {
      const errorKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('route_error_')
      );
      
      const errors = errorKeys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter(Boolean);

      return errors.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to get route errors:', error);
      return [];
    }
  }, []);

  const clearRouteErrors = React.useCallback(() => {
    try {
      const errorKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('route_error_')
      );
      
      errorKeys.forEach(key => localStorage.removeItem(key));
      console.log('Route errors cleared');
    } catch (error) {
      console.error('Failed to clear route errors:', error);
    }
  }, []);

  return { getRouteErrors, clearRouteErrors };
};