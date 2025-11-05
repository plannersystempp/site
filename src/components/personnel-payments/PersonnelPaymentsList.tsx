import { PersonnelPaymentCard } from './PersonnelPaymentCard';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';
import type { PersonnelPayment } from '@/contexts/data/types';

interface PersonnelPaymentsListProps {
  payments: (PersonnelPayment & { personnel?: any })[];
  loading: boolean;
}

export const PersonnelPaymentsList = ({ payments, loading }: PersonnelPaymentsListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="Nenhum pagamento encontrado"
        description="Não há pagamentos cadastrados com os filtros selecionados."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {payments.map((payment) => (
        <PersonnelPaymentCard key={payment.id} payment={payment} />
      ))}
    </div>
  );
};
