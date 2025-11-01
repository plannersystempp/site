import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlertCardsProps {
  expiringTrials: number;
  orphanUsers: number;
  unassignedErrors: number;
}

export function AlertCards({ expiringTrials, orphanUsers, unassignedErrors }: AlertCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {expiringTrials > 0 && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg">Trials Expirando</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              <strong>{expiringTrials}</strong> trial{expiringTrials > 1 ? 's' : ''} expira
              {expiringTrials > 1 ? 'm' : ''} nos próximos 7 dias
            </p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="#subscriptions">Ver Detalhes</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {orphanUsers > 0 && (
        <Alert className="border-2 border-yellow-500">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <AlertTitle className="text-lg">Usuários Órfãos</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              <strong>{orphanUsers}</strong> usuário{orphanUsers > 1 ? 's' : ''} sem equipe 
              {orphanUsers > 1 ? 's' : ''}
            </p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="#orphans">Gerenciar</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {unassignedErrors > 0 && (
        <Alert className="border-2 border-blue-500">
          <Info className="h-5 w-5 text-blue-500" />
          <AlertTitle className="text-lg">Reportes Pendentes</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              <strong>{unassignedErrors}</strong> reporte{unassignedErrors > 1 ? 's' : ''} de erro 
              não atribuído{unassignedErrors > 1 ? 's' : ''}
            </p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="#errors">Verificar</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
