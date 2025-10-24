import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bug, 
  AlertTriangle, 
  Zap, 
  Database, 
  Network, 
  Timer,
  RefreshCw,
  TestTube,
  Play
} from 'lucide-react';
import { TestErrorComponent } from './TestErrorComponent';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import { FormErrorBoundary } from './FormErrorBoundary';

interface ErrorTestCase {
  id: string;
  name: string;
  description: string;
  level: 'component' | 'section' | 'page';
  icon: React.ReactNode;
  errorType: string;
  testFunction: () => void;
}

export const ErrorTester: React.FC = () => {
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  // Função para simular erro de componente
  const triggerComponentError = () => {
    setLastTriggered('component');
    throw new Error('Erro simulado de componente: Falha na renderização do componente de teste');
  };

  // Função para simular erro de rede
  const triggerNetworkError = () => {
    setLastTriggered('network');
    throw new Error('Erro simulado de rede: Falha na conexão com a API');
  };

  // Função para simular erro de dados
  const triggerDataError = () => {
    setLastTriggered('data');
    throw new Error('Erro simulado de dados: Dados corrompidos ou inválidos');
  };

  // Função para simular erro assíncrono
  const triggerAsyncError = () => {
    setLastTriggered('async');
    setTimeout(() => {
      throw new Error('Erro assíncrono simulado: Falha em operação assíncrona');
    }, 1000);
  };

  // Função para simular erro de timeout
  const triggerTimeoutError = () => {
    setLastTriggered('timeout');
    throw new Error('Erro simulado de timeout: Operação excedeu o tempo limite');
  };

  // Função para simular erro crítico de página
  const triggerPageError = () => {
    setLastTriggered('page');
    throw new Error('Erro crítico simulado: Falha crítica que afeta toda a página');
  };

  // Função para simular erro de JavaScript
  const triggerJSError = () => {
    setLastTriggered('javascript');
    // Tentar acessar propriedade de undefined
    const obj: any = undefined;
    console.log(obj.property.nested);
  };

  // Função para simular erro de tipo
  const triggerTypeError = () => {
    setLastTriggered('type');
    // Tentar chamar função em não-função
    const notAFunction: any = "string";
    notAFunction();
  };

  const errorTests: ErrorTestCase[] = [
    {
      id: 'component',
      name: 'Erro de Componente',
      description: 'Simula erro durante renderização de componente',
      level: 'component',
      icon: <Bug className="w-4 h-4" />,
      errorType: 'RenderError',
      testFunction: triggerComponentError
    },
    {
      id: 'network',
      name: 'Erro de Rede',
      description: 'Simula falha de conexão com API',
      level: 'section',
      icon: <Network className="w-4 h-4" />,
      errorType: 'NetworkError',
      testFunction: triggerNetworkError
    },
    {
      id: 'data',
      name: 'Erro de Dados',
      description: 'Simula dados corrompidos ou inválidos',
      level: 'section',
      icon: <Database className="w-4 h-4" />,
      errorType: 'DataError',
      testFunction: triggerDataError
    },
    {
      id: 'timeout',
      name: 'Erro de Timeout',
      description: 'Simula operação que excede tempo limite',
      level: 'component',
      icon: <Timer className="w-4 h-4" />,
      errorType: 'TimeoutError',
      testFunction: triggerTimeoutError
    },
    {
      id: 'page',
      name: 'Erro Crítico',
      description: 'Simula erro crítico que afeta toda a página',
      level: 'page',
      icon: <AlertTriangle className="w-4 h-4" />,
      errorType: 'CriticalError',
      testFunction: triggerPageError
    },
    {
      id: 'javascript',
      name: 'Erro de JavaScript',
      description: 'Simula erro de acesso a propriedade undefined',
      level: 'component',
      icon: <Zap className="w-4 h-4" />,
      errorType: 'TypeError',
      testFunction: triggerJSError
    },
    {
      id: 'type',
      name: 'Erro de Tipo',
      description: 'Simula erro de chamada de função inválida',
      level: 'component',
      icon: <Bug className="w-4 h-4" />,
      errorType: 'TypeError',
      testFunction: triggerTypeError
    },
    {
      id: 'async',
      name: 'Erro Assíncrono',
      description: 'Simula erro em operação assíncrona (setTimeout)',
      level: 'section',
      icon: <RefreshCw className="w-4 h-4" />,
      errorType: 'AsyncError',
      testFunction: triggerAsyncError
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'page': return 'destructive';
      case 'section': return 'secondary';
      case 'component': return 'outline';
      default: return 'outline';
    }
  };

  const handleTestError = (testCase: ErrorTestCase) => {
    try {
      testCase.testFunction();
    } catch (error) {
      // O erro será capturado pelo Error Boundary
      console.log(`Erro ${testCase.id} disparado:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TestTube className="w-6 h-6" />
        <div>
          <h2 className="text-2xl font-bold">Testador de Error Boundaries</h2>
          <p className="text-muted-foreground">
            Use os botões abaixo para testar diferentes tipos de erros e validar o funcionamento dos Error Boundaries
          </p>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> Estes testes irão disparar erros reais que serão capturados pelos Error Boundaries. 
          Use apenas em ambiente de desenvolvimento para validar o sistema de tratamento de erros.
        </AlertDescription>
      </Alert>

      {lastTriggered && (
        <Alert>
          <Bug className="h-4 w-4" />
          <AlertDescription>
            Último erro disparado: <strong>{lastTriggered}</strong> - 
            Verifique se o Error Boundary capturou o erro corretamente.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">Testes Manuais</TabsTrigger>
          <TabsTrigger value="components">Componentes de Teste</TabsTrigger>
          <TabsTrigger value="boundaries">Testar Boundaries</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {errorTests.map((testCase) => (
              <Card key={testCase.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {testCase.icon}
                      <CardTitle className="text-lg">{testCase.name}</CardTitle>
                    </div>
                    <Badge variant={getLevelColor(testCase.level) as any}>
                      {testCase.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {testCase.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono bg-muted px-2 py-1 rounded">
                      {testCase.errorType}
                    </span>
                    <span className="text-muted-foreground">
                      Nível: {testCase.level}
                    </span>
                  </div>

                  <Button 
                    onClick={() => handleTestError(testCase)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Disparar Erro
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TestErrorComponent 
              errorType="render" 
              message="Erro de renderização do componente de teste"
            />
            <TestErrorComponent 
              errorType="effect" 
              delay={2000}
              message="Erro no useEffect com delay"
            />
            <TestErrorComponent 
              errorType="async" 
              delay={1500}
              message="Erro em operação assíncrona"
            />
            <TestErrorComponent 
              errorType="state" 
              message="Erro ao manipular estado"
            />
            <TestErrorComponent 
              errorType="props" 
              message="Erro ao acessar props"
            />
          </div>
        </TabsContent>

        <TabsContent value="boundaries" className="space-y-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Teste do DashboardErrorBoundary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardErrorBoundary section="KPIs">
                  <TestErrorComponent 
                    errorType="render" 
                    message="Erro simulado no Dashboard - Seção KPIs"
                  />
                </DashboardErrorBoundary>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Teste do FormErrorBoundary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormErrorBoundary formName="TestForm">
                  <TestErrorComponent 
                    errorType="render" 
                    message="Erro simulado em Formulário"
                  />
                </FormErrorBoundary>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Teste de Múltiplos Erros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DashboardErrorBoundary section="Charts">
                    <TestErrorComponent 
                      errorType="effect" 
                      delay={1000}
                      message="Erro no Dashboard - Charts"
                    />
                  </DashboardErrorBoundary>
                  
                  <FormErrorBoundary formName="MultiTestForm">
                    <TestErrorComponent 
                      errorType="async" 
                      delay={2000}
                      message="Erro assíncrono em Form"
                    />
                  </FormErrorBoundary>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p><strong>1.</strong> Clique em qualquer botão "Disparar Erro" para simular um erro específico</p>
            <p><strong>2.</strong> Observe como o Error Boundary captura e exibe o erro</p>
            <p><strong>3.</strong> Teste as opções de recuperação (Tentar Novamente, Recarregar Página)</p>
            <p><strong>4.</strong> Verifique o console do navegador para logs detalhados</p>
            <p><strong>5.</strong> Acesse o Dashboard de Erros (Admin) para ver os relatórios</p>
          </div>
          
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Erros assíncronos podem não ser capturados pelos Error Boundaries do React. 
              Estes devem ser tratados com try/catch ou handlers específicos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};