import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number;
  billing_cycle: string;
  limits: {
    max_team_members: number | null;
    max_events_per_month: number | null;
    max_personnel: number | null;
  };
}

interface CurrentSubscription {
  plan_id: string;
  status: string;
}

export default function UpgradePlan() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null>(null);
  const navigate = useNavigate();
  const checkoutMutation = useStripeCheckout();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Buscar planos
    const { data: plansData } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (plansData) {
      setPlans(plansData as any);
    }

    // Buscar assinatura atual do usuário
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: teamData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single();

      if (teamData) {
        setTeamId(teamData.team_id);
        
        const { data: subscriptionData } = await supabase
          .from('team_subscriptions')
          .select('plan_id, status')
          .eq('team_id', teamData.team_id)
          .single();

        if (subscriptionData) {
          setCurrentSubscription(subscriptionData);
        }
      }
    }

    setLoading(false);
  };

  const handleSelectPlan = async (planId: string, planName: string) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!teamId) {
      toast({
        title: "Equipe não encontrada",
        description: "Você precisa estar vinculado a uma equipe.",
        variant: "destructive"
      });
      return;
    }

    // Se for trial, redirecionar para auth
    if (planName.toLowerCase() === 'trial') {
      navigate('/auth');
      return;
    }

    const confirmed = window.confirm(
      `Deseja assinar o plano ${planName}?\n\n` +
      `Você será redirecionado para o pagamento seguro via Stripe.`
    );

    if (!confirmed) return;

    try {
      const checkoutData = await checkoutMutation.mutateAsync({ planId, teamId });
      
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  const formatLimit = (value: number | null) => {
    return value === null ? 'Ilimitado' : value.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Escolha o Melhor Plano para Você</h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus eventos sem limites. Faça upgrade a qualquer momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${isCurrentPlan(plan.id) ? 'border-primary shadow-lg' : ''}`}
            >
              {isCurrentPlan(plan.id) && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Plano Atual
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold">
                    R$ {plan.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    por {plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      <strong>{formatLimit(plan.limits.max_team_members)}</strong> membros da equipe
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      <strong>{formatLimit(plan.limits.max_events_per_month)}</strong> eventos por mês
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      <strong>{formatLimit(plan.limits.max_personnel)}</strong> cadastros de pessoal
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan(plan.id) ? 'secondary' : 'default'}
                  disabled={isCurrentPlan(plan.id) || checkoutMutation.isPending}
                  onClick={() => handleSelectPlan(plan.id, plan.display_name)}
                >
                  {checkoutMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isCurrentPlan(plan.id) ? 'Plano Atual' : 
                   plan.price === 0 ? 'Iniciar Trial' : 'Assinar Agora'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
