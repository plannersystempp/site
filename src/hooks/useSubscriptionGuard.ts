import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { parseDateSafe } from '@/utils/dateUtils';

interface SubscriptionStatus {
  isActive: boolean;
  status: string;
  planName: string;
  expiresAt: string | null;
  daysUntilExpiration?: number;
}

export function useSubscriptionGuard(teamId: string | undefined) {
  const navigate = useNavigate();

  // Check if user is superadmin - they bypass all subscription checks
  const { data: isSuperAdmin } = useQuery({
    queryKey: ['is-superadmin'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (error) throw error;
      return data as boolean;
    }
  });

  // SuperAdmin bypass - they have full access
  if (isSuperAdmin) {
    return {
      subscription: null,
      isLoading: false,
      canProceed: true,
      isActive: true
    };
  }

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['team-subscription', teamId],
    queryFn: async (): Promise<SubscriptionStatus | null> => {
      if (!teamId) return null;

      const { data, error } = await supabase
        .from('team_subscriptions')
        .select(`
          status,
          current_period_ends_at,
          trial_ends_at,
          subscription_plans(display_name)
        `)
        .eq('team_id', teamId)
        .single();

      if (error) {
        console.error('Erro ao buscar assinatura:', error);
        throw error;
      }

      // Confiar no status do banco - não sobrescrever
      const isActive = ['active', 'trial'].includes(data.status);
      const expiresAt = data.trial_ends_at || data.current_period_ends_at;
      
      let daysUntilExpiration = undefined;
      
      if (expiresAt) {
        const expirationDate = parseDateSafe(expiresAt);
        
        // Validar se a data é válida
        if (isNaN(expirationDate.getTime())) {
          console.error('⚠️ [useSubscriptionGuard] Data de expiração inválida:', expiresAt);
          // NÃO marcar como inativa, apenas alertar
        } else {
          const now = new Date();
          // Comparação direta funciona porque ambas são timestamps UTC internamente
          daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          console.log('🔍 [useSubscriptionGuard] Debug:', {
            status: data.status,
            expiresAt,
            expirationDate: expirationDate.toISOString(),
            now: now.toISOString(),
            daysUntilExpiration
          });
        }
      }
      
      return {
        isActive, // Usar status do banco, não sobrescrever
        status: data.status,
        planName: (data.subscription_plans as any)?.display_name || 'Desconhecido',
        expiresAt,
        daysUntilExpiration
      };
    },
    enabled: !!teamId,
    refetchInterval: 60000, // Revalidar a cada 1 minuto
    retry: 2
  });

  useEffect(() => {
    if (!isLoading && subscription) {
      // APENAS redirecionar se status do BANCO for expired/canceled/past_due
      const inactiveStatuses = ['expired', 'canceled', 'past_due', 'trial_expired'];
      
      if (inactiveStatuses.includes(subscription.status)) {
        toast({
          title: 'Assinatura Inativa',
          description: 'Sua assinatura expirou. Renove para continuar usando o SIGE.',
          variant: 'destructive',
          duration: 5000
        });
        
        setTimeout(() => {
          navigate('/plans');
        }, 3000);
      }
      // Avisar se estiver próximo da expiração (últimos 7 dias)
      else if (subscription.daysUntilExpiration && subscription.daysUntilExpiration <= 7 && subscription.daysUntilExpiration > 0) {
        toast({
          title: 'Assinatura Expirando em Breve',
          description: `Sua assinatura ${subscription.planName} expira em ${subscription.daysUntilExpiration} dia(s).`,
          variant: 'default',
          duration: 7000
        });
      }
    }
  }, [subscription, isLoading, navigate]);

  return {
    subscription,
    isLoading,
    canProceed: subscription?.isActive || false,
    isActive: subscription?.isActive || false
  };
}
