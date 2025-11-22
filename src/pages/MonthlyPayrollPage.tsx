import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ArrowLeft, Info } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { NoTeamSelected } from '@/components/shared/NoTeamSelected';
import { MonthlyPayrollTable } from '@/components/payroll/MonthlyPayrollTable';
import { useMonthlyPayrollQuery } from '@/hooks/queries/useMonthlyPayrollQuery';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

export const MonthlyPayrollPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeTeam, userRole } = useTeam();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { monthlyPayrollDetails, monthlyPaymentDay, loading } = useMonthlyPayrollQuery(
    selectedMonth,
    selectedYear
  );

  const canManagePayroll = userRole === 'admin' || userRole === 'financeiro';

  const handleMarkAsPaid = async (personnelId: string, amount: number) => {
    if (!activeTeam?.id) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const monthName = MONTHS.find(m => m.value === selectedMonth)?.label;
      const paymentDueDate = new Date(selectedYear, selectedMonth, monthlyPaymentDay);

      const { error } = await supabase
        .from('personnel_payments')
        .insert({
          team_id: activeTeam.id,
          personnel_id: personnelId,
          amount,
          description: `Pagamento Mensal - ${monthName}/${selectedYear}`,
          payment_due_date: paymentDueDate.toISOString().split('T')[0],
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          paid_by_id: user.user?.id,
          created_by_id: user.user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Pagamento registrado com sucesso',
      });

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['monthly-payroll'] });
      queryClient.invalidateQueries({ queryKey: ['personnel-payments'] });
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao registrar pagamento',
        variant: 'destructive',
      });
    }
  };

  if (!activeTeam) {
    return (
      <NoTeamSelected
        title="Folha de Pagamento Mensal"
        description="Selecione uma equipe para gerenciar a folha mensal."
      />
    );
  }

  if (!canManagePayroll) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Apenas administradores e financeiro podem gerenciar a folha de pagamento mensal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedMonthName = MONTHS.find(m => m.value === selectedMonth)?.label;
  const paymentDate = `${String(monthlyPaymentDay).padStart(2, '0')}/${String(selectedMonth + 1).padStart(2, '0')}/${selectedYear}`;

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          onClick={() => navigate('/app/folha')}
          className="-ml-2"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            Folha de Pagamento Mensal - Fixos
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pagamento mensal de funcionários fixos (salário + cachês + horas extras)
          </p>
        </div>

        {/* Seletores de Mês/Ano */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select
            value={String(selectedMonth)}
            onValueChange={(value) => setSelectedMonth(Number(value))}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(month => (
                <SelectItem key={month.value} value={String(month.value)}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(selectedYear)}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(year => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info de data de pagamento */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Data de pagamento configurada:</strong> Dia {monthlyPaymentDay} de cada mês
            {' '}({paymentDate})
          </AlertDescription>
        </Alert>
      </div>

      {/* Card Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{selectedMonthName} / {selectedYear}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <MonthlyPayrollTable
              details={monthlyPayrollDetails}
              onMarkAsPaid={handleMarkAsPaid}
              canManagePayroll={canManagePayroll}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyPayrollPage;
