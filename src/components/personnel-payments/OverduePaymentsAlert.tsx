import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OverduePaymentsAlertProps {
  count: number;
  amount: number;
}

export const OverduePaymentsAlert = ({ count, amount }: OverduePaymentsAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Pagamentos Atrasados</AlertTitle>
      <AlertDescription>
        Existem <strong>{count}</strong> pagamento(s) atrasado(s) totalizando{' '}
        <strong>
          {amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </strong>
        .
      </AlertDescription>
    </Alert>
  );
};
