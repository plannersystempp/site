import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CreditCard, Calendar, Users, FileText, Briefcase, Shield, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDateShort } from '@/utils/dateUtils';

interface SubscriptionData {
  plan_name: string;
  status: string;
  current_period_ends_at: string;
  trial_ends_at: string | null;
  limits: {
    max_team_members: number | null;
    max_events_per_month: number | null;
    max_personnel: number | null;
  };
}

export default function ManageSubscription() {
  const navigate = useNavigate();
  const { activeTeam } = useTeam();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is superadmin
  const { data: isSuperAdmin, isLoading: checkingSuperAdmin } = useQuery({
    queryKey: ['is-superadmin'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (error) throw error;
      return data as boolean;
    }
  });

  useEffect(() => {
    if (activeTeam && !isSuperAdmin) {
      loadSubscription();
    } else if (!activeTeam && !isSuperAdmin) {
      setLoading(false);
    } else if (isSuperAdmin) {
      setLoading(false);
    }
  }, [activeTeam, isSuperAdmin]);

  const loadSubscription = async () => {
    if (!activeTeam) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_subscriptions')
        .select(`
          status,
          current_period_ends_at,
          trial_ends_at,
          subscription_plans(display_name, limits)
        `)
        .eq('team_id', activeTeam.id)
        .single();

      if (error) throw error;

      if (data) {
        setSubscription({
          plan_name: (data.subscription_plans as any)?.display_name || 'Desconhecido',
          status: data.status,
          current_period_ends_at: data.current_period_ends_at,
          trial_ends_at: data.trial_ends_at,
          limits: (data.subscription_plans as any)?.limits || {}
        });
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Ativa' },
      trial: { variant: 'secondary', label: 'Trial' },
      trial_expired: { variant: 'destructive', label: 'Trial Expirado' },
      canceled: { variant: 'outline', label: 'Cancelada' }
    };
    const badge = badges[status] || { variant: 'outline', label: status };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const formatLimit = (value: number | null) => {
    return value === null ? 'Ilimitado' : value.toString();
  };

  if (loading || checkingSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // SuperAdmin special view
  if (isSuperAdmin) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertTitle>Acesso de Super Administrador</AlertTitle>
          <AlertDescription>
            Como Super Admin, você não possui uma assinatura pessoal. Você tem acesso ilimitado a todas as funcionalidades do sistema.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={() => navigate('/app')} 
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie sua assinatura do SIGE
          </p>
        </div>
      </div>

      {!subscription ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhuma assinatura encontrada</h2>
            <p className="text-muted-foreground mb-4">
              Você ainda não possui uma assinatura ativa.
            </p>
            <Button onClick={() => navigate('/app/upgrade')}>
              Ver Planos Disponíveis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Plano Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{subscription.plan_name}</p>
                  <p className="text-sm text-muted-foreground">Status: {getStatusBadge(subscription.status)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {subscription.trial_ends_at 
                      ? `Trial expira em: ${formatDateShort(subscription.trial_ends_at)}`
                      : `Renovação em: ${formatDateShort(subscription.current_period_ends_at)}`
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limites do Plano */}
          <Card>
            <CardHeader>
              <CardTitle>Limites do Plano</CardTitle>
              <CardDescription>
                Recursos disponíveis no seu plano atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Membros da Equipe:</span>
                <span className="font-semibold">{formatLimit(subscription.limits.max_team_members)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Eventos por Mês:</span>
                <span className="font-semibold">{formatLimit(subscription.limits.max_events_per_month)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cadastros de Pessoal:</span>
                <span className="font-semibold">{formatLimit(subscription.limits.max_personnel)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate('/app/upgrade')}
              >
                Fazer Upgrade do Plano
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/app/plans')}
              >
                Ver Todos os Planos
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
