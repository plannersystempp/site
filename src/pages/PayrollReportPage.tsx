import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { usePayrollData } from '@/components/payroll/usePayrollData';

export const PayrollReportPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { events } = useEnhancedData();
  const { activeTeam } = useTeam();
  const { payrollDetails, loading } = usePayrollData(eventId || '');

  const selectedEvent = events.find(e => e.id === eventId);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/app/folha');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalGeral = payrollDetails.reduce((sum, item) => sum + item.totalPay, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Botões de ação - ocultos na impressão */}
      <div className="no-print sticky top-0 z-10 bg-background border-b p-4 flex gap-2">
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Conteúdo do relatório */}
      <div className="print-section p-8 max-w-[210mm] mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Relatório de Folha de Pagamento</h1>
          <h2 className="text-lg text-muted-foreground mb-1">{selectedEvent?.name}</h2>
          <h3 className="text-md text-muted-foreground">{activeTeam?.name}</h3>
        </div>

        {/* Tabela */}
        <div className="payroll-table-container">
          <table className="payroll-table">
            <thead>
              <tr>
                <th className="payroll-th">Nome</th>
                <th className="payroll-th">Tipo</th>
                <th className="payroll-th text-right">Valor Total</th>
                <th className="payroll-th text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {payrollDetails.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'payroll-row-even' : 'payroll-row-odd'}>
                  <td className="payroll-td">{item.personName}</td>
                  <td className="payroll-td">{item.personType}</td>
                  <td className="payroll-td text-right">{formatCurrency(item.totalPay)}</td>
                  <td className="payroll-td text-center">{item.paid ? 'Pago' : 'Pendente'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="payroll-total-row">
                <td colSpan={2} className="payroll-td font-bold">Total Geral:</td>
                <td className="payroll-td text-right font-bold">{formatCurrency(totalGeral)}</td>
                <td className="payroll-td"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
