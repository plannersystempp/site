
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado' | 'concluido_pagamento_pendente';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    planejado: { label: 'Planejado', variant: 'secondary' as const },
    em_andamento: { label: 'Em Andamento', variant: 'default' as const },
    concluido: { label: 'Concluído', variant: 'outline' as const },
    cancelado: { label: 'Cancelado', variant: 'destructive' as const },
    concluido_pagamento_pendente: { label: 'Pagamento Pendente', variant: 'secondary' as const }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};
