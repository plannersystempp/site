import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePaymentHistory } from '@/hooks/queries/usePersonnelHistoryQuery';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EmptyState } from '@/components/shared/EmptyState';

interface PaymentHistoryTabProps {
  personnelId: string;
}

export const PaymentHistoryTab: React.FC<PaymentHistoryTabProps> = ({ personnelId }) => {
  const { data: payments, isLoading } = usePaymentHistory(personnelId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="Nenhum pagamento registrado"
        description="Esta pessoa ainda não recebeu nenhum pagamento registrado no sistema"
      />
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full flex-shrink-0">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-xs sm:text-sm leading-tight text-green-600 dark:text-green-400">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <p className="text-sm font-medium mb-1 truncate">{payment.eventName}</p>
                  <p className="text-xs text-muted-foreground">
                    Pago em {format(new Date(payment.paidAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  {payment.notes && (
                    <p className="text-xs text-muted-foreground italic mt-2 p-2 bg-muted/50 rounded">
                      "{payment.notes}"
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground mb-1">
                  {format(new Date(payment.eventStartDate), 'dd/MM/yy')} - {format(new Date(payment.eventEndDate), 'dd/MM/yy')}
                </p>
                <Badge variant="outline" className="text-xs">
                  {payment.eventStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
