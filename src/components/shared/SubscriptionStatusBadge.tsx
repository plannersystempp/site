import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

type SubscriptionStatus = 'active' | 'trial' | 'trialing' | 'past_due' | 'trial_expired' | 'canceled' | 'unpaid';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus | string;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
  labelOverride?: string;
}

export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  status,
  className,
  showLabel = true,
  compact = false,
  labelOverride,
}) => {
  const variants: Record<string, { className: string; icon?: React.ElementType; label: string }> = {
    active: { className: 'bg-green-900/20 text-green-400', icon: CheckCircle, label: 'Ativa' },
    trial: { className: 'bg-purple-900/25 text-purple-300', icon: Clock, label: 'Trial' },
    trialing: { className: 'bg-purple-900/25 text-purple-300', icon: Clock, label: 'Trial' },
    past_due: { className: 'bg-orange-900/20 text-orange-400', icon: AlertTriangle, label: 'Vencido' },
    trial_expired: { className: 'bg-red-900/20 text-red-400', icon: AlertTriangle, label: 'Trial Expirado' },
    canceled: { className: 'bg-gray-900/20 text-gray-400', icon: XCircle, label: 'Cancelada' },
    unpaid: { className: 'bg-red-900/20 text-red-400', icon: AlertTriangle, label: 'Não Paga' },
  };

  const cfg = variants[status] || { className: 'bg-muted/30 dark:bg-muted/20 text-muted-foreground', label: String(status) };
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