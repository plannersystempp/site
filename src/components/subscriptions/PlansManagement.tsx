import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Power, Star, Zap, Crown, Check } from 'lucide-react';
import { PlanFormDialog } from './PlanFormDialog';
import { usePlanMutations } from '@/hooks/usePlanMutations';
import { toast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'annually';
  limits: {
    max_team_members: number | null;
    max_events_per_month: number | null;
    max_personnel: number | null;
  };
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  stripe_product_id?: string;
  stripe_price_id?: string;
}

export function PlansManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { togglePlanStatus } = usePlanMutations();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as unknown as Plan[];
    }
  });

  const handleCreateNew = () => {
    setSelectedPlan(null);
    setDialogOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleToggleStatus = async (plan: Plan) => {
    // Verificar se tem assinaturas ativas
    const { data: activeSubscriptions } = await supabase
      .from('team_subscriptions')
      .select('id')
      .eq('plan_id', plan.id)
      .in('status', ['active', 'trial']);

    if (activeSubscriptions && activeSubscriptions.length > 0 && plan.is_active) {
      toast({
        title: 'Aviso',
        description: `Existem ${activeSubscriptions.length} assinatura(s) ativa(s) neste plano. Desativar o plano impedirá novas assinaturas, mas não afetará as existentes.`,
        variant: 'default'
      });
    }

    togglePlanStatus.mutate({ id: plan.id, is_active: !plan.is_active });
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('basic')) return <Zap className="h-6 w-6 text-blue-500" />;
    if (planName.includes('professional')) return <Star className="h-6 w-6 text-purple-500" />;
    if (planName.includes('enterprise')) return <Crown className="h-6 w-6 text-amber-500" />;
    return <Check className="h-6 w-6 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Planos</h2>
          <p className="text-sm text-muted-foreground">Crie e edite planos de assinatura</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {plans?.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative transition-all hover:shadow-lg ${
              plan.is_popular ? 'border-primary ring-1 ring-primary/20' : ''
            } ${!plan.is_active ? 'opacity-60' : ''}`}
          >
            {plan.is_popular && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">
                  ⭐ Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-muted">
                  {getPlanIcon(plan.name)}
                </div>
                <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                  {plan.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div>
                <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {plan.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center py-2">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-bold text-primary">
                    R$ {plan.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    /{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                  {plan.limits.max_team_members === null ? (
                    <span className="text-green-600 font-medium">Membros ilimitados</span>
                  ) : (
                    <span>Até <strong>{plan.limits.max_team_members}</strong> membros</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                  {plan.limits.max_events_per_month === null ? (
                    <span className="text-green-600 font-medium">Eventos ilimitados</span>
                  ) : (
                    <span>Até <strong>{plan.limits.max_events_per_month}</strong> eventos/mês</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                  {plan.limits.max_personnel === null ? (
                    <span className="text-green-600 font-medium">Profissionais ilimitados</span>
                  ) : (
                    <span>Até <strong>{plan.limits.max_personnel}</strong> profissionais</span>
                  )}
                </div>
              </div>

              {Array.isArray(plan.features) && plan.features.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Recursos:</p>
                  <div className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs line-clamp-1">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{plan.features.length - 3} mais...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(plan)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button
                variant={plan.is_active ? 'secondary' : 'default'}
                size="sm"
                className="flex-1"
                onClick={() => handleToggleStatus(plan)}
                disabled={togglePlanStatus.isPending}
              >
                <Power className="h-3 w-3 mr-1" />
                {plan.is_active ? 'Desativar' : 'Ativar'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PlanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={selectedPlan}
      />
    </div>
  );
}
