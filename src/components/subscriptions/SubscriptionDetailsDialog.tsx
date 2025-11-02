import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanChangeTimeline } from './PlanChangeTimeline';

interface SubscriptionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
}

interface SubscriptionDetails {
  id: string;
  team_id: string;
  status: string;
  trial_ends_at: string | null;
  current_period_starts_at: string;
  current_period_ends_at: string;
  created_at: string;
  teams: {
    name: string;
    cnpj: string | null;
  };
  subscription_plans: {
    display_name: string;
    price: number;
    billing_cycle: string;
  };
}

export function SubscriptionDetailsDialog({ 
  open, 
  onOpenChange, 
  subscriptionId 
}: SubscriptionDetailsDialogProps) {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadSubscriptionDetails();
    }
  }, [open, subscriptionId]);

  const loadSubscriptionDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('team_subscriptions')
      .select(`
        *,
        teams!inner(name, cnpj),
        subscription_plans!inner(display_name, price, billing_cycle)
      `)
      .eq('id', subscriptionId)
      .single();

    if (!error && data) {
      setSubscription(data as any);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Assinatura</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : subscription ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Equipe</h3>
                <p className="text-lg font-semibold">{subscription.teams.name}</p>
                {subscription.teams.cnpj && (
                  <p className="text-sm text-muted-foreground">CNPJ: {subscription.teams.cnpj}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Plano Atual</h3>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{subscription.subscription_plans.display_name}</p>
                  <Badge>{subscription.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  R$ {subscription.subscription_plans.price.toFixed(2)} / {subscription.subscription_plans.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Criação</h3>
                  <p className="text-sm">
                    {format(new Date(subscription.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {subscription.status === 'trial' ? 'Trial Expira em' : 'Período Atual Termina em'}
                  </h3>
                  <p className="text-sm">
                    {format(
                      new Date(subscription.trial_ends_at || subscription.current_period_ends_at),
                      'dd/MM/yyyy',
                      { locale: ptBR }
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Início do Período</h3>
                  <p className="text-sm">
                    {format(new Date(subscription.current_period_starts_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Fim do Período</h3>
                  <p className="text-sm">
                    {format(new Date(subscription.current_period_ends_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <PlanChangeTimeline teamId={subscription.team_id} />
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Não foi possível carregar os detalhes da assinatura.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
