import React from 'react';
import { Calculator, Users } from 'lucide-react';
import { PayrollDetails } from './types';
import { PayrollDetailsCard } from './PayrollDetailsCard';

interface PayrollListProps {
  payrollDetails: PayrollDetails[];
  loading: boolean;
  pixKeys: Record<string, string>;
  onRegisterPayment: (personnelId: string, totalAmount: number, notes?: string) => void;
  onRegisterPartialPayment: (personnelId: string, amount: number, notes: string) => void;
  onCancelPayment: (paymentId: string, personnelName: string) => void;
}

export const PayrollList: React.FC<PayrollListProps> = ({
  payrollDetails,
  loading,
  pixKeys,
  onRegisterPayment,
  onRegisterPartialPayment,
  onCancelPayment
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Calculator className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (payrollDetails.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Nenhum profissional alocado neste evento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payrollDetails.map(detail => (
        <PayrollDetailsCard
          key={detail.id}
          detail={detail}
          onRegisterPayment={onRegisterPayment}
          onRegisterPartialPayment={onRegisterPartialPayment}
          onCancelPayment={onCancelPayment}
          loading={loading}
          pixKey={pixKeys[detail.personnelId]}
          hasEventSpecificCache={detail.hasEventSpecificCache}
          eventSpecificCacheRate={detail.eventSpecificCacheRate}
        />
      ))}
    </div>
  );
};