import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bug, AlertTriangle, Zap } from 'lucide-react';

interface TestErrorComponentProps {
  errorType?: 'render' | 'effect' | 'async' | 'state' | 'props';
  triggerOnMount?: boolean;
  delay?: number;
  message?: string;
}

export const TestErrorComponent: React.FC<TestErrorComponentProps> = ({
  errorType = 'render',
  triggerOnMount = false,
  delay = 0,
  message = 'Erro de teste simulado'
}) => {
  const [shouldError, setShouldError] = useState(triggerOnMount);
  const [asyncError, setAsyncError] = useState(false);
  const [count, setCount] = useState(0);

  // Erro no useEffect
  useEffect(() => {
    if (errorType === 'effect' && shouldError) {
      if (delay > 0) {
        setTimeout(() => {
          throw new Error(`${message} - useEffect com delay de ${delay}ms`);
        }, delay);
      } else {
        throw new Error(`${message} - useEffect`);
      }
    }
  }, [shouldError, errorType, delay, message]);

  // Erro assíncrono
  useEffect(() => {
    if (errorType === 'async' && shouldError) {
      const triggerAsyncError = async () => {
        try {
          await new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`${message} - Operação assíncrona`));
            }, delay || 1000);
          });
        } catch (error) {
          setAsyncError(true);
          throw error;
        }
      };
      
      triggerAsyncError();
    }
  }, [shouldError, errorType, delay, message]);

  // Erro de estado
  if (errorType === 'state' && shouldError) {
    // Simular erro ao tentar atualizar estado com valor inválido
    const invalidState: any = undefined;
    setCount(invalidState.length); // Isso causará um erro
  }

  // Erro de props
  if (errorType === 'props' && shouldError) {
    // Simular erro ao acessar props inexistentes
    const props: any = undefined;
    console.log(props.nonExistent.property);
  }

  // Erro de renderização
  if (errorType === 'render' && shouldError) {
    throw new Error(`${message} - Erro de renderização`);
  }

  const triggerError = () => {
    setShouldError(true);
  };

  const getErrorTypeInfo = () => {
    switch (errorType) {
      case 'render':
        return {
          title: 'Erro de Renderização',
          description: 'Erro que ocorre durante o processo de renderização do componente',
          icon: <Bug className="w-4 h-4" />,
          variant: 'destructive' as const
        };
      case 'effect':
        return {
          title: 'Erro no useEffect',
          description: 'Erro que ocorre dentro de um hook useEffect',
          icon: <Zap className="w-4 h-4" />,
          variant: 'secondary' as const
        };
      case 'async':
        return {
          title: 'Erro Assíncrono',
          description: 'Erro que ocorre em operações assíncronas',
          icon: <AlertTriangle className="w-4 h-4" />,
          variant: 'outline' as const
        };
      case 'state':
        return {
          title: 'Erro de Estado',
          description: 'Erro ao manipular o estado do componente',
          icon: <Bug className="w-4 h-4" />,
          variant: 'secondary' as const
        };
      case 'props':
        return {
          title: 'Erro de Props',
          description: 'Erro ao acessar propriedades do componente',
          icon: <AlertTriangle className="w-4 h-4" />,
          variant: 'outline' as const
        };
      default:
        return {
          title: 'Erro Genérico',
          description: 'Tipo de erro não especificado',
          icon: <Bug className="w-4 h-4" />,
          variant: 'outline' as const
        };
    }
  };

  const errorInfo = getErrorTypeInfo();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {errorInfo.icon}
            <CardTitle className="text-lg">{errorInfo.title}</CardTitle>
          </div>
          <Badge variant={errorInfo.variant}>
            {errorType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {errorInfo.description}
        </p>

        {delay > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro será disparado com delay de {delay}ms
            </AlertDescription>
          </Alert>
        )}

        {asyncError && (
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              Erro assíncrono detectado! Verifique o console.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Contador: {count}</span>
          <span>Status: {shouldError ? 'Erro Ativo' : 'Normal'}</span>
        </div>

        {!shouldError && (
          <Button 
            onClick={triggerError}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <Bug className="w-4 h-4 mr-2" />
            Disparar {errorInfo.title}
          </Button>
        )}

        {shouldError && errorType !== 'render' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro foi disparado! Se você está vendo esta mensagem, 
              o Error Boundary pode não ter capturado este tipo de erro.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};