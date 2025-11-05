import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DemoAccountResponse {
  success: boolean;
  credentials: {
    email: string;
    password: string;
  };
  team: {
    id: string;
    name: string;
    invite_code: string;
  };
  statistics: {
    personnel: number;
    events: number;
    allocations: number;
    divisions: number;
    suppliers: number;
    supplier_items: number;
    event_costs: number;
    personnel_payments: number;
    ratings: number;
    absences: number;
    payroll_closings: number;
  };
  financial_summary: {
    total_revenue: number;
    total_costs: number;
    net_profit: number;
  };
  quick_facts: string[];
  access_link: string;
}

export const useCreateDemoAccount = () => {
  return useMutation({
    mutationFn: async (): Promise<DemoAccountResponse> => {
      const { data, error } = await supabase.functions.invoke<DemoAccountResponse>('create-demo-account', {
        body: {}
      });

      if (error) {
        throw error;
      }

      if (!data || !data.success) {
        throw new Error('Falha ao criar conta demo');
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Conta Demo Criada!',
        description: `Conta "${data.team.name}" criada com ${data.statistics.events} eventos e ${data.statistics.personnel} profissionais.`,
        duration: 5000
      });
    },
    onError: (error: Error) => {
      console.error('Erro ao criar conta demo:', error);
      toast({
        title: 'Erro ao Criar Conta Demo',
        description: error.message || 'Ocorreu um erro ao criar a conta de demonstração.',
        variant: 'destructive',
        duration: 5000
      });
    }
  });
};
