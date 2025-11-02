import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PlanFormData {
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

export function usePlanMutations() {
  const queryClient = useQueryClient();

  const createPlan = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const { error } = await supabase
        .from('subscription_plans')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['public-plans'] });
      toast({ title: 'Plano criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar plano',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PlanFormData> }) => {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['public-plans'] });
      toast({ title: 'Plano atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar plano',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const togglePlanStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['public-plans'] });
      toast({ 
        title: variables.is_active ? 'Plano ativado!' : 'Plano desativado!',
        description: variables.is_active 
          ? 'O plano agora está visível para os usuários'
          : 'O plano não estará mais disponível para novas assinaturas'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    createPlan,
    updatePlan,
    togglePlanStatus
  };
}
