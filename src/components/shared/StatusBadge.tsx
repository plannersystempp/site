
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

type StatusType = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado' | 'concluido_pagamento_pendente';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showLabel?: boolean; // permite ocultar label em espaços reduzidos
  compact?: boolean; // aplica "hidden sm:inline" no label
  labelOverride?: string; // opcional para sobrescrever o texto
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showLabel = true,
  compact = true,
  labelOverride,
}) => {
  const config: Record<StatusType, { label: string; icon: React.ReactNode; className: string }> = {
    planejado: {
      label: 'Planejado',
      icon: <Clock className="h-4 w-4" />,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
    },
    em_andamento: {
      label: 'Em Andamento',
      icon: <AlertCircle className="h-4 w-4" />,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300',
    },
    concluido: {
      label: 'Concluído',
      icon: <CheckCircle className="h-4 w-4" />,
      className: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
    },
    cancelado: {
      label: 'Cancelado',
      icon: <AlertCircle className="h-4 w-4" />,
      className: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
    },
    concluido_pagamento_pendente: {
      label: 'Pagamento Pendente',
      icon: <DollarSign className="h-4 w-4" />,
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
    },
  };

  const chosen = config[status];
  const label = labelOverride ?? chosen.label;
  const labelClass = compact ? 'ml-1 hidden sm:inline' : 'ml-1';

  return (
    <Badge className={`${chosen.className} ${className ?? ''}`}>
      {chosen.icon}
      {showLabel && <span className={labelClass}>{label}</span>}
    </Badge>
  );
};
