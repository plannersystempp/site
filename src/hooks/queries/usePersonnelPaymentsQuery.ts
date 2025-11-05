import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import type { PersonnelPayment } from '@/contexts/data/types';

export const personnelPaymentsKeys = {
  all: ['personnel-payments'] as const,
  byTeam: (teamId: string) => [...personnelPaymentsKeys.all, teamId] as const,
  byStatus: (teamId: string, status: string) => [...personnelPaymentsKeys.byTeam(teamId), status] as const,
  byPersonnel: (personnelId: string) => [...personnelPaymentsKeys.all, 'personnel', personnelId] as const,
  stats: (teamId: string) => [...personnelPaymentsKeys.byTeam(teamId), 'stats'] as const,
};

interface UsePersonnelPaymentsFilters {
  status?: 'pending' | 'paid' | 'cancelled';
  personnelId?: string;
  overdue?: boolean;
}

export const usePersonnelPaymentsQuery = (filters?: UsePersonnelPaymentsFilters) => {
  const { activeTeam } = useTeam();

  return useQuery({
    queryKey: filters 
      ? [...personnelPaymentsKeys.byTeam(activeTeam?.id || ''), filters]
      : personnelPaymentsKeys.byTeam(activeTeam?.id || ''),
    queryFn: async () => {
      if (!activeTeam?.id) return [];

      let query = supabase
        .from('personnel_payments')
        .select(`
          *,
          personnel:personnel_id (
            id,
            name,
            type,
            email,
            phone
          )
        `)
        .eq('team_id', activeTeam.id)
        .order('payment_due_date', { ascending: true });

      if (filters?.status) {
        query = query.eq('payment_status', filters.status);
      }

      if (filters?.personnelId) {
        query = query.eq('personnel_id', filters.personnelId);
      }

      if (filters?.overdue) {
        const today = new Date().toISOString().split('T')[0];
        query = query
          .eq('payment_status', 'pending')
          .lt('payment_due_date', today);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (PersonnelPayment & { personnel: any })[];
    },
    enabled: !!activeTeam?.id,
    staleTime: 0, // Sempre buscar dados frescos
    refetchOnMount: true, // Refetch ao montar componente
  });
};

export const usePersonnelPaymentStatsQuery = () => {
  const { activeTeam } = useTeam();

  return useQuery({
    queryKey: personnelPaymentsKeys.stats(activeTeam?.id || ''),
    queryFn: async () => {
      if (!activeTeam?.id) return null;

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('personnel_payments')
        .select('payment_status, amount, payment_due_date')
        .eq('team_id', activeTeam.id);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: 0,
        paid: 0,
        overdue: 0,
        totalPendingAmount: 0,
        totalOverdueAmount: 0,
      };

      data.forEach((payment) => {
        if (payment.payment_status === 'pending') {
          stats.pending++;
          stats.totalPendingAmount += Number(payment.amount);
          
          if (payment.payment_due_date < today) {
            stats.overdue++;
            stats.totalOverdueAmount += Number(payment.amount);
          }
        } else if (payment.payment_status === 'paid') {
          stats.paid++;
        }
      });

      return stats;
    },
    enabled: !!activeTeam?.id,
    staleTime: 0, // Stats sempre atualizadas
    refetchOnMount: true,
  });
};
