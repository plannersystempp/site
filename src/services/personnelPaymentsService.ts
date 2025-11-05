import { supabase } from '@/integrations/supabase/client';
import type { CreatePersonnelPaymentData, UpdatePersonnelPaymentData } from '@/contexts/data/formTypes';
import type { PersonnelPayment } from '@/contexts/data/types';

export const personnelPaymentsService = {
  /**
   * Cria um novo pagamento avulso
   */
  async create(data: CreatePersonnelPaymentData): Promise<PersonnelPayment> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data: result, error } = await supabase
      .from('personnel_payments')
      .insert({
        ...data,
        created_by_id: user.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return result as PersonnelPayment;
  },

  /**
   * Atualiza um pagamento existente
   */
  async update(id: string, data: UpdatePersonnelPaymentData): Promise<PersonnelPayment> {
    const { data: result, error } = await supabase
      .from('personnel_payments')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as PersonnelPayment;
  },

  /**
   * Marca um pagamento como pago
   */
  async markAsPaid(id: string, paymentMethod?: string): Promise<PersonnelPayment> {
    const { data: result, error } = await supabase
      .from('personnel_payments')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as PersonnelPayment;
  },

  /**
   * Cancela um pagamento
   */
  async cancel(id: string): Promise<PersonnelPayment> {
    const { data: result, error } = await supabase
      .from('personnel_payments')
      .update({
        payment_status: 'cancelled',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as PersonnelPayment;
  },

  /**
   * Deleta um pagamento
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('personnel_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Busca pagamentos atrasados de uma equipe
   */
  async getOverdue(teamId: string): Promise<PersonnelPayment[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('personnel_payments')
      .select('*')
      .eq('team_id', teamId)
      .eq('payment_status', 'pending')
      .lt('payment_due_date', today);

    if (error) throw error;
    return data as PersonnelPayment[];
  },

  /**
   * Busca estatísticas de pagamentos
   */
  async getStats(teamId: string): Promise<{
    total: number;
    pending: number;
    paid: number;
    overdue: number;
    totalPendingAmount: number;
    totalOverdueAmount: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('personnel_payments')
      .select('payment_status, amount, payment_due_date')
      .eq('team_id', teamId);

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
};
