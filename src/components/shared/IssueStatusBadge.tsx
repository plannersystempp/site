import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Wrench, CheckCircle, MinusCircle } from 'lucide-react';

type IssueStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

interface IssueStatusBadgeProps {
  status: IssueStatus | string;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
  labelOverride?: string;
}

export const IssueStatusBadge: React.FC<IssueStatusBadgeProps> = ({
  status,
  className,
  showLabel = true,
  compact = false,
  labelOverride,
}) => {
  const variants: Record<string, { className: string; icon?: React.ElementType; label: string }> = {
    new: { className: 'bg-blue-900/20 text-blue-400', icon: AlertCircle, label: 'Novo' },
    in_progress: { className: 'bg-purple-900/20 text-purple-400', icon: Wrench, label: 'Investigando' },
    resolved: { className: 'bg-green-900/20 text-green-400', icon: CheckCircle, label: 'Resolvido' },
    closed: { className: 'bg-gray-900/20 text-gray-400', icon: MinusCircle, label: 'Fechado' },
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