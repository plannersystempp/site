import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

type ApprovalStatus = 'approved' | 'pending' | 'rejected';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus | string;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
  labelOverride?: string;
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
  status,
  className,
  showLabel = true,
  compact = false,
  labelOverride,
}) => {
  const variants: Record<string, { className: string; icon?: React.ElementType; label: string }> = {
    approved: { className: 'bg-green-900/20 text-green-400', icon: CheckCircle, label: 'Aprovado' },
    pending: { className: 'bg-orange-900/20 text-orange-400', icon: Clock, label: 'Pendente' },
    rejected: { className: 'bg-red-900/20 text-red-400', icon: XCircle, label: 'Desaprovado' },
  };

  const cfg = variants[status] || { className: 'bg-muted/30 dark:bg-muted/20 text-muted-foreground', label: 'Desconhecido' };
  const Icon = (cfg as any).icon;

  return (
    <Badge className={`${cfg.className} ${className || ''}`}>
      {Icon && <Icon className="h-3.5 w-3.5 mr-1" />}
      {showLabel && (
        <span className={compact ? 'hidden sm:inline' : ''}>{labelOverride || cfg.label}</span>
      )}
    </Badge>
  );
};