import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Bug, Home, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorReporting } from '@/services/errorReporting';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'section' | 'component';
  name?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;

  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Usar o serviço centralizado de relatório de erros
    const errorId = errorReporting.reportError({
      error,
      errorInfo,
      level: this.props.level || 'component',
      component: this.props.name || 'Unknown',
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        props: this.props
      },
      metadata: {
        retryCount: this.state.retryCount
      }
    });

    // Callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo, errorId });
  }

  private reportError = async (errorDetails: any) => {
    // Removido - agora usando o serviço centralizado
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: this.state.retryCount + 1
    });
  };

  private handleGoHome = () => {
    window.location.href = '/app';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private copyErrorDetails = () => {
    const errorText = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
Component: ${this.props.name || 'Unknown'}
Level: ${this.props.level || 'component'}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}

Stack Trace:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      toast({
        title: "Detalhes copiados",
        description: "Os detalhes do erro foram copiados para a área de transferência.",
        duration: 3000,
      });
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar os detalhes do erro.",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  private renderErrorLevel() {
    const level = this.props.level || 'component';
    const levelConfig = {
      page: { color: 'destructive', label: 'Página' },
      section: { color: 'secondary', label: 'Seção' },
      component: { color: 'outline', label: 'Componente' }
    };

    return (
      <Badge variant={levelConfig[level].color as any}>
        {levelConfig[level].label}
      </Badge>
    );
  }

  private renderActions() {
    const level = this.props.level || 'component';
    
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={this.handleReset} 
          variant="outline" 
          className="flex-1"
          disabled={this.state.retryCount >= 3}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente {this.state.retryCount > 0 && `(${this.state.retryCount}/3)`}
        </Button>
        
        {level === 'page' ? (
          <Button onClick={this.handleGoHome} className="flex-1">
            <Home className="w-4 h-4 mr-2" />
            Ir para Início
          </Button>
        ) : (
          <Button onClick={this.handleGoBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}
        
        <Button 
          onClick={this.handleReload} 
          variant="secondary"
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recarregar Página
        </Button>
      </div>
    );
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const level = this.props.level || 'component';
      const isPageLevel = level === 'page';

      return (
        <div className={`${isPageLevel ? 'min-h-screen' : 'min-h-[200px]'} flex items-center justify-center p-4`}>
          <Card className={`w-full ${isPageLevel ? 'max-w-lg' : 'max-w-md'}`}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 text-destructive mb-4">
                <AlertTriangle className="w-full h-full" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-lg">
                  {isPageLevel ? 'Erro na Página' : 'Erro no Componente'}
                </CardTitle>
                {this.renderErrorLevel()}
              </div>
              {this.props.name && (
                <p className="text-sm text-muted-foreground">
                  Componente: <code className="bg-muted px-1 rounded">{this.props.name}</code>
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {isPageLevel 
                  ? 'Ocorreu um erro inesperado nesta página. Tente recarregar ou voltar para o início.'
                  : 'Ocorreu um erro neste componente. Você pode tentar novamente ou continuar navegando.'
                }
              </p>

              {this.state.retryCount >= 3 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    ⚠️ Múltiplas tentativas falharam. Considere recarregar a página ou reportar o erro.
                  </p>
                </div>
              )}
              
              {this.state.error && (
                <details className="text-xs bg-muted p-3 rounded">
                  <summary className="cursor-pointer font-medium flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Detalhes Técnicos
                    <Badge variant="outline" className="ml-auto">
                      {this.state.errorId}
                    </Badge>
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <strong>Erro:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs bg-background p-2 rounded border">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs bg-background p-2 rounded border max-h-32 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    <Button
                      onClick={this.copyErrorDetails}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copiar Detalhes do Erro
                    </Button>
                  </div>
                </details>
              )}
              
              {this.renderActions()}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}