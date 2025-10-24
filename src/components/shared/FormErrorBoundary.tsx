import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, RefreshCw, AlertTriangle, Save } from 'lucide-react';

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  formName?: string;
  onDataRecover?: () => void;
}

const FormFallback = ({ 
  formName, 
  onDataRecover 
}: { 
  formName?: string; 
  onDataRecover?: () => void;
}) => (
  <Card className="border-destructive/20 bg-destructive/5">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <CardTitle className="text-base">
          Erro no Formulário {formName && `- ${formName}`}
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Ocorreu um erro no formulário. Seus dados podem ter sido preservados automaticamente.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col sm:flex-row gap-2">
        {onDataRecover && (
          <Button 
            onClick={onDataRecover}
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Recuperar Dados
          </Button>
        )}
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          size="sm"
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recarregar Formulário
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        💡 Dica: Seus dados podem estar salvos no armazenamento local do navegador.
      </p>
    </CardContent>
  </Card>
);

export const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({ 
  children, 
  formName,
  onDataRecover
}) => {
  const handleFormError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log específico para erros de formulário
    console.group('📝 Form Error');
    console.error('Form:', formName || 'Unknown');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Tentar salvar dados do formulário no localStorage como backup
    try {
      const formData = document.querySelectorAll('input, textarea, select');
      const backupData: Record<string, string> = {};
      
      formData.forEach((element) => {
        const input = element as HTMLInputElement;
        if (input.name && input.value) {
          backupData[input.name] = input.value;
        }
      });

      if (Object.keys(backupData).length > 0) {
        const backupKey = `form_backup_${formName || 'unknown'}_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(backupData));
        console.log('📦 Form data backed up to localStorage:', backupKey);
      }
    } catch (backupError) {
      console.error('Failed to backup form data:', backupError);
    }
  };

  return (
    <ErrorBoundary
      level="section"
      name={`Form-${formName || 'Unknown'}`}
      fallback={<FormFallback formName={formName} onDataRecover={onDataRecover} />}
      onError={handleFormError}
    >
      {children}
    </ErrorBoundary>
  );
};

// Wrapper específico para campos de formulário críticos
export const CriticalFieldErrorBoundary: React.FC<{ 
  children: React.ReactNode; 
  fieldName?: string;
}> = ({ children, fieldName }) => {
  const FieldFallback = () => (
    <div className="border border-destructive/20 bg-destructive/5 rounded-md p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">
          Erro no campo {fieldName || 'desconhecido'}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Este campo está temporariamente indisponível. Tente recarregar a página.
      </p>
    </div>
  );

  return (
    <ErrorBoundary
      level="component"
      name={`Field-${fieldName || 'Unknown'}`}
      fallback={<FieldFallback />}
    >
      {children}
    </ErrorBoundary>
  );
};

// Hook para recuperar dados de formulário do backup
export const useFormDataRecovery = (formName: string) => {
  const recoverFormData = React.useCallback(() => {
    try {
      const backupKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(`form_backup_${formName}`)
      );
      
      if (backupKeys.length === 0) {
        console.log('No backup data found for form:', formName);
        return null;
      }

      // Pegar o backup mais recente
      const latestBackupKey = backupKeys.sort().pop();
      if (!latestBackupKey) return null;

      const backupData = localStorage.getItem(latestBackupKey);
      if (!backupData) return null;

      const parsedData = JSON.parse(backupData);
      console.log('📦 Recovered form data:', parsedData);
      
      // Limpar o backup após recuperação
      localStorage.removeItem(latestBackupKey);
      
      return parsedData;
    } catch (error) {
      console.error('Failed to recover form data:', error);
      return null;
    }
  }, [formName]);

  return { recoverFormData };
};