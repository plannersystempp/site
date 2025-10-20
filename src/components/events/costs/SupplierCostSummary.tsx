import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { EventSupplierCost } from '@/contexts/data/types';
import { formatCurrency } from '@/utils/formatters';

interface SupplierCostSummaryProps {
  costs: EventSupplierCost[];
}

export const SupplierCostSummary: React.FC<SupplierCostSummaryProps> = ({ costs }) => {
  const totalCost = costs.reduce((sum, cost) => sum + cost.total_amount, 0);
  const totalPaid = costs.reduce((sum, cost) => sum + cost.paid_amount, 0);
  const totalPending = totalCost - totalPaid;

  const pendingCount = costs.filter(c => c.payment_status === 'pending').length;
  const paidCount = costs.filter(c => c.payment_status === 'paid').length;
  const partialCount = costs.filter(c => c.payment_status === 'partially_paid').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
          <p className="text-xs text-muted-foreground">Custo Total</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          <p className="text-xs text-muted-foreground">Total Pago</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalPending)}</div>
          <p className="text-xs text-muted-foreground">Pendente</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{costs.length}</div>
          <p className="text-xs text-muted-foreground">
            {paidCount} pagos • {partialCount} parciais • {pendingCount} pendentes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
