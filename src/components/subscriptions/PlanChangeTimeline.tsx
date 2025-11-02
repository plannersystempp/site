import { usePlanChangeHistory } from '@/hooks/usePlanChangeHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, CheckCircle2, TrendingUp, TrendingDown, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PlanChangeTimelineProps {
  teamId: string;
}

export function PlanChangeTimeline({ teamId }: PlanChangeTimelineProps) {
  const { data: history, isLoading } = usePlanChangeHistory({ teamId });

  const getChangeIcon = (action: string, oldValues: any, newValues: any) => {
    if (action === 'INSERT') {
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    }
    
    if (newValues?.status === 'canceled') {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }

    // Upgrade vs Downgrade baseado no preço
    if (oldValues?.price && newValues?.price) {
      if (newValues.price > oldValues.price) {
        return <TrendingUp className="h-5 w-5 text-success" />;
      } else if (newValues.price < oldValues.price) {
        return <TrendingDown className="h-5 w-5 text-warning" />;
      }
    }

    return <Clock className="h-5 w-5 text-primary" />;
  };

  const getChangeLabel = (action: string, oldValues: any, newValues: any) => {
    if (action === 'INSERT') {
      return 'Primeira Assinatura';
    }
    
    if (newValues?.status === 'canceled') {
      return 'Assinatura Cancelada';
    }

    if (newValues?.status === 'active' && oldValues?.status === 'trial') {
      return 'Trial Convertido em Pago';
    }

    if (oldValues?.plan_display_name && newValues?.plan_display_name) {
      return 'Mudança de Plano';
    }

    return 'Atualização da Assinatura';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Nenhuma mudança de plano registrada</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Linha vertical da timeline */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />

      {history.map((item, index) => {
        const isLast = index === history.length - 1;
        
        return (
          <div key={item.id} className="relative flex gap-4">
            {/* Ícone da timeline */}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background bg-card shadow-sm">
              {getChangeIcon(item.action, item.old_values, item.new_values)}
            </div>

            {/* Card de conteúdo */}
            <Card className="flex-1 p-4 shadow-sm">
              {/* Header: Data e tipo de mudança */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <Badge variant="outline" className="mb-1">
                    {getChangeLabel(item.action, item.old_values, item.new_values)}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Mudança de plano */}
              {item.old_values?.plan_display_name && item.new_values?.plan_display_name && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{item.old_values.plan_display_name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-primary">{item.new_values.plan_display_name}</span>
                </div>
              )}

              {/* Primeira assinatura */}
              {item.action === 'INSERT' && item.new_values?.plan_display_name && (
                <div className="mb-2">
                  <span className="font-medium text-sm text-primary">{item.new_values.plan_display_name}</span>
                </div>
              )}

              {/* Mudança de preço */}
              {item.old_values?.price !== undefined && item.new_values?.price !== undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Valor: R$ {item.old_values.price.toFixed(2)}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium">R$ {item.new_values.price.toFixed(2)}</span>
                </div>
              )}

              {/* Preço da primeira assinatura */}
              {item.action === 'INSERT' && item.new_values?.price !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Valor: <span className="font-medium">R$ {item.new_values.price.toFixed(2)}</span>
                </div>
              )}

              {/* Mudança de status */}
              {item.old_values?.status && item.new_values?.status && item.old_values.status !== item.new_values.status && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-xs">{item.old_values.status}</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="outline" className="text-xs">{item.new_values.status}</Badge>
                </div>
              )}

              {/* Quem fez a mudança */}
              {item.user_name && (
                <p className="text-xs text-muted-foreground mt-2">
                  Por: <span className="font-medium">{item.user_name}</span>
                  {item.user_email && <span className="ml-1">({item.user_email})</span>}
                </p>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
