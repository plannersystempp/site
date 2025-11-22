import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePersonnelPaymentsQuery, usePersonnelPaymentStatsQuery } from '@/hooks/queries/usePersonnelPaymentsQuery';
import { usePersonnelPaymentsRealtime } from '@/hooks/queries/usePersonnelPaymentsRealtime';
import { PersonnelPaymentsList } from './PersonnelPaymentsList';
import { PersonnelPaymentFormDialog } from './PersonnelPaymentFormDialog';
import { PaymentFilters } from './PaymentFilters';
import { OverduePaymentsAlert } from './OverduePaymentsAlert';
import { PaymentStatsCards } from './PaymentStatsCards';

export const PersonnelPaymentsManager = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<{
    status?: 'pending' | 'paid' | 'cancelled';
    personnelId?: string;
  }>({});

  const { data: payments, isLoading } = usePersonnelPaymentsQuery(filters);
  const { data: stats } = usePersonnelPaymentStatsQuery();
  
  usePersonnelPaymentsRealtime();

  const handlePrintReport = () => {
    const params = new URLSearchParams();
    if (filters.status) {
      params.set('status', filters.status);
    }
    navigate(`/app/pagamentos-avulsos/relatorio?${params.toString()}`);
  };

  return (
    <div className="container mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Pagamentos Avulsos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie pagamentos a pessoal sem vínculo direto com eventos específicos
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <Button onClick={handlePrintReport} variant="outline" size="default" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Imprimir Relatório</span>
            <span className="sm:hidden">Imprimir</span>
          </Button>
          <Button onClick={() => setShowForm(true)} size="default" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      {stats && stats.overdue > 0 && <OverduePaymentsAlert count={stats.overdue} amount={stats.totalOverdueAmount} />}
      
      {stats && <PaymentStatsCards stats={stats} />}
      
      <PaymentFilters filters={filters} onChange={setFilters} />
      
      <PersonnelPaymentsList payments={payments || []} loading={isLoading} />

      {showForm && (
        <PersonnelPaymentFormDialog
          open={showForm}
          onOpenChange={setShowForm}
        />
      )}
    </div>
  );
};
