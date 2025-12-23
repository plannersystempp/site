
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';
import { EventData } from './types';
import { invalidateCache } from './eventStatusCache';
import { notificationService } from '@/services/notificationService';
import { payrollKeys } from '@/hooks/queries/usePayrollQuery';
import { monthlyPayrollKeys } from '@/hooks/queries/useMonthlyPayrollQuery';
import { personnelHistoryKeys } from '@/hooks/queries/usePersonnelHistoryQuery';

export const invalidateAfterPayrollClosingChange = (
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: string,
  personnelId?: string
) => {
  if (eventId) {
    queryClient.invalidateQueries({
      queryKey: payrollKeys.event(eventId),
      refetchType: 'active',
    });
  }

  queryClient.invalidateQueries({
    queryKey: payrollKeys.all,
    refetchType: 'active',
  });

  queryClient.invalidateQueries({
    queryKey: monthlyPayrollKeys.all,
    refetchType: 'active',
  });

  if (personnelId) {
    queryClient.invalidateQueries({
      queryKey: personnelHistoryKeys.all(personnelId),
      refetchType: 'active',
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: ['personnel-history'],
      refetchType: 'active',
    });
  }
};

export const usePayrollActions = (
  selectedEventId: string,
  setEventData: React.Dispatch<React.SetStateAction<EventData>>
) => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRegisterPayment = async (personnelId: string, totalAmount: number, notes?: string) => {
    if (!user || !activeTeam) return;

    // VALIDAÇÃO: Verificar se a pessoa está alocada no evento
    const { data: allocations, error: allocError } = await supabase
      .from('personnel_allocations')
      .select('id')
      .eq('event_id', selectedEventId)
      .eq('personnel_id', personnelId);

    if (allocError) {
      console.error('Error checking allocation:', allocError);
      toast({
        title: "Erro",
        description: "Falha ao verificar alocação",
        variant: "destructive"
      });
      return;
    }

    if (!allocations || allocations.length === 0) {
      toast({
        title: "Erro de Validação",
        description: "Esta pessoa não está alocada neste evento. Não é possível registrar pagamento.",
        variant: "destructive"
      });
      return;
    }

    const confirmation = window.confirm(
      `Confirma o registro de pagamento de ${formatCurrency(totalAmount)}?`
    );

    if (!confirmation) return;

    try {
        const { data, error } = await supabase
        .from('payroll_closings')
        .insert([{
          event_id: selectedEventId,
          personnel_id: personnelId,
          total_amount_paid: totalAmount,
          team_id: activeTeam.id,
          notes: notes || null,
          paid_by_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setEventData(prev => ({
        ...prev,
        closings: [...prev.closings, {
          id: data.id,
          event_id: selectedEventId,
          personnel_id: personnelId,
          total_amount_paid: totalAmount,
          paid_at: data.paid_at,
          team_id: activeTeam.id,
          created_at: data.created_at,
          notes: notes || undefined
        }]
      }));

      // Obter nome do evento para notificação
      const { data: eventData } = await supabase
        .from('events')
        .select('name')
        .eq('id', selectedEventId)
        .single();

      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso",
      });
      
      // Enviar notificação
      if (eventData && activeTeam?.id) {
        await notificationService.notifyPaymentReceived(
          totalAmount,
          eventData.name,
          activeTeam.id
        );
      }
      
      // Invalidar cache para foru007far atualizau007fu007fo nos dashboards
      invalidateCache();

      invalidateAfterPayrollClosingChange(queryClient, selectedEventId, personnelId);
    } catch (error) {
      console.error('Error registering payment:', error);
      toast({
        title: "Erro",
        description: "Falha ao registrar pagamento",
        variant: "destructive"
      });
    }
  };

  const handleRegisterPartialPayment = async (personnelId: string, amount: number, notes: string) => {
    if (!user || !activeTeam) return;

    // VALIDAÇÃO: Verificar se a pessoa está alocada no evento
    const { data: allocations, error: allocError } = await supabase
      .from('personnel_allocations')
      .select('id')
      .eq('event_id', selectedEventId)
      .eq('personnel_id', personnelId);

    if (allocError) {
      console.error('Error checking allocation:', allocError);
      toast({
        title: "Erro",
        description: "Falha ao verificar alocação",
        variant: "destructive"
      });
      return;
    }

    if (!allocations || allocations.length === 0) {
      toast({
        title: "Erro de Validação",
        description: "Esta pessoa não está alocada neste evento. Não é possível registrar pagamento.",
        variant: "destructive"
      });
      return;
    }

    const confirmation = window.confirm(
      `Confirma o registro de pagamento parcial de ${formatCurrency(amount)}?`
    );

    if (!confirmation) return;

    try {
      const { data, error } = await supabase
        .from('payroll_closings')
        .insert([{
          event_id: selectedEventId,
          personnel_id: personnelId,
          total_amount_paid: amount,
          team_id: activeTeam.id,
          notes: notes || null,
          paid_by_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setEventData(prev => ({
        ...prev,
        closings: [...prev.closings, {
          id: data.id,
          event_id: selectedEventId,
          personnel_id: personnelId,
          total_amount_paid: amount,
          paid_at: data.paid_at,
          team_id: activeTeam.id,
          created_at: data.created_at,
          notes: notes || undefined
        }]
      }));

      // Obter nome do evento para notificação
      const { data: eventData } = await supabase
        .from('events')
        .select('name')
        .eq('id', selectedEventId)
        .single();

      toast({
        title: "Sucesso",
        description: "Pagamento parcial registrado com sucesso",
      });
      
      // Enviar notificação
      if (eventData && activeTeam?.id) {
        await notificationService.notifyPaymentReceived(
          amount,
          eventData.name,
          activeTeam.id
        );
      }
      
      // Invalidar cache para foru007far atualizau007fu007fo nos dashboards
      invalidateCache();

      invalidateAfterPayrollClosingChange(queryClient, selectedEventId, personnelId);
    } catch (error) {
      console.error('Error registering partial payment:', error);
      toast({
        title: "Erro",
        description: "Falha ao registrar pagamento parcial",
        variant: "destructive"
      });
    }
  };

  const handleCancelPayment = async (paymentId: string, personName: string) => {
    try {
      if (!activeTeam?.id || !selectedEventId) {
        toast({
          title: "Erro",
          description: "Equipe ou evento não definidos para cancelar pagamento.",
          variant: "destructive"
        });
        return;
      }

      // Diagnu007fstico: checar se o registro estu007f visu007fvel antes de apagar
      const { data: closingRow } = await supabase
        .from('payroll_closings')
        .select('id, event_id, team_id, personnel_id, paid_by_id')
        .eq('id', paymentId)
        .maybeSingle();

      // Deletar pelo id apenas, para evitar mismatch de filtros
      const { data: deletedRows, error } = await supabase
        .from('payroll_closings')
        .delete()
        .eq('id', paymentId)
        .select();

      if (error) throw error;
      if (!deletedRows || deletedRows.length === 0) {
        throw new Error('Nenhum registro foi removido. Verifique políticas de acesso (RLS).');
      }

      setEventData(prev => ({
        ...prev,
        closings: prev.closings.filter(closing => closing.id !== paymentId)
      }));

      toast({
        title: "Sucesso",
        description: `Pagamento de ${personName} foi cancelado com sucesso`,
      });
      
      // Invalidar cache para foru007far atualizau007fu007fo nos dashboards
      invalidateCache();

      const closingPersonnelId = closingRow?.personnel_id
        ? String(closingRow.personnel_id)
        : undefined;

      invalidateAfterPayrollClosingChange(
        queryClient,
        selectedEventId,
        closingPersonnelId
      );
    } catch (error) {
      console.error('Error canceling payment:', error);
      const message = error instanceof Error ? error.message : 'Falha ao cancelar pagamento';
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    }
  };

  return {
    handleRegisterPayment,
    handleRegisterPartialPayment,
    handleCancelPayment
  };
};
