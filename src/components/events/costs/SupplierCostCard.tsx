import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Edit, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { EventSupplierCost } from '@/contexts/data/types';
import { formatDateBR } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatters';

interface SupplierCostCardProps {
  cost: EventSupplierCost;
  onEdit: (cost: EventSupplierCost) => void;
}

export const SupplierCostCard: React.FC<SupplierCostCardProps> = ({ cost, onEdit }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const getStatusBadge = () => {
    if (cost.payment_status === 'pending') {
      return <StatusBadge status={'concluido_pagamento_pendente'} labelOverride="Pendente" />;
    }
    const statusConfig = {
      partially_paid: { label: 'Parcial', variant: 'default' as const },
      paid: { label: 'Pago', variant: 'default' as const }
    } as const;

    const config = (statusConfig as any)[cost.payment_status];
    return config ? <Badge variant={config.variant}>{config.label}</Badge> : <Badge variant="outline">{cost.payment_status}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">{cost.description}</CardTitle>
            <p className="text-sm text-muted-foreground">{cost.supplier_name}</p>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(cost)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {cost.category && (
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{cost.category}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Quantidade</p>
            <p className="font-medium">{cost.quantity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Preço Unit.</p>
            <p className="font-medium">{formatCurrency(cost.unit_price)}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{formatCurrency(cost.total_amount)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          {getStatusBadge()}
          <span className="text-xs text-muted-foreground">
            Pago: {formatCurrency(cost.paid_amount)}
          </span>
        </div>

        {cost.payment_date && (
          <div className="text-xs text-muted-foreground">
            Pago em: {formatDateBR(cost.payment_date)}
          </div>
        )}

        {cost.notes && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p className="line-clamp-2">{cost.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
