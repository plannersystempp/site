
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';
import { EventData } from './types';
import { invalidateCache } from './eventStatusCache';
import { notificationService } from '@/services/notificationService';

export const usePayrollActions = (
  selectedEventId: string,
  setEventData: React.Dispatch<React.SetStateAction<EventData>>
) => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();
  const { toast } = useToast();

  const handleRegisterPayment = async (personnelId: string, totalAmount: number, notes?: string) => {
    if (!user || !activeTeam) return;

    // VALIDAÇÃO: Verificar se a pessoa está alocada no evento
    const { data: allocation, error: allocError } = await supabase
      .from('personnel_allocations')
      .select('id')
      .eq('event_id', selectedEventId)
      .eq('personnel_id', personnelId)
      .maybeSingle();

    if (allocError) {
      console.error('Error checking allocation:', allocError);
      toast({
        title: "Erro",
        description: "Falha ao verificar alocação",
        variant: "destructive"
      });
      return;
    }

    if (!allocation) {
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
      
      // Invalidar cache para forçar atualização nos dashboards
      invalidateCache();
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
    const { data: allocation, error: allocError } = await supabase
      .from('personnel_allocations')
      .select('id')
      .eq('event_id', selectedEventId)
      .eq('personnel_id', personnelId)
      .maybeSingle();

    if (allocError) {
      console.error('Error checking allocation:', allocError);
      toast({
        title: "Erro",
        description: "Falha ao verificar alocação",
        variant: "destructive"
      });
      return;
    }

    if (!allocation) {
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
      
      // Invalidar cache para forçar atualização nos dashboards
      invalidateCache();
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
      const { error } = await supabase
        .from('payroll_closings')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      setEventData(prev => ({
        ...prev,
        closings: prev.closings.filter(closing => closing.id !== paymentId)
      }));

      toast({
        title: "Sucesso",
        description: `Pagamento de ${personName} foi cancelado com sucesso`,
      });
      
      // Invalidar cache para forçar atualização nos dashboards
      invalidateCache();
    } catch (error) {
      console.error('Error canceling payment:', error);
      toast({
        title: "Erro",
        description: "Falha ao cancelar pagamento",
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
