import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { usePayrollData } from '@/components/payroll/usePayrollData';
import { PayrollPrintTable } from '@/components/payroll/PayrollPrintTable';

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
    if (eventId) {
      navigate(`/app/folha/${eventId}`);
    } else {
      navigate('/app/folha');
    }
  };

  const handleGoToEvent = () => {
    if (eventId) {
      navigate(`/app/eventos/${eventId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalGeral = payrollDetails.reduce((sum, item) => sum + item.totalPay, 0);
  // Exibir "Pago (parcial)" APENAS quando há valor pago e ainda há pendência
  const hasPartialPayments = payrollDetails.some(
    (item) => (item.paidAmount || 0) > 0 && (item.pendingAmount || 0) > 0
  );
  const totalPagoParcial = payrollDetails
    .filter((item) => (item.paidAmount || 0) > 0 && (item.pendingAmount || 0) > 0)
    .reduce((sum, item) => sum + (item.paidAmount || 0), 0);
  const totalPendente = payrollDetails.reduce((sum, item) => sum + (item.pendingAmount || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Estilos específicos para esta página - APENAS PARA TELA */}
      <style>{`
        /* ESTILOS APENAS PARA VISUALIZAÇÃO NA TELA */
        @media screen {
          .payroll-report-page .payroll-table-container {
            background: transparent;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 24px;
            margin: 1rem 0;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          }
          
          .payroll-report-page .payroll-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border: 2px solid #cbd5e1;
            border-radius: 6px;
            overflow: hidden;
            table-layout: fixed;
          }
          
          .payroll-report-page .payroll-th {
            background-color: #f8fafc;
            border-bottom: 2px solid #cbd5e1;
            border-right: 1px solid #cbd5e1;
            padding: 16px 12px;
            font-weight: 600;
            font-size: 14px;
            line-height: 1.6;
            color: #1e293b;
          }
          
          .payroll-report-page .payroll-th:last-child {
            border-right: none;
          }
          
          .payroll-report-page .payroll-td {
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            padding: 14px 12px;
            font-size: 13px;
            line-height: 1.7;
            white-space: nowrap;
            color: #1e293b;
          }
          
          .payroll-report-page .payroll-td:first-child {
            white-space: normal;
            width: 28%;
          }
          
          .payroll-report-page .payroll-td:last-child {
            border-right: none;
          }
          
          .payroll-report-page .payroll-row-even {
            background-color: #f8fafc;
          }
          
          .payroll-report-page .payroll-row-odd {
            background-color: white;
          }
          
          .payroll-report-page .payroll-total-row {
            background-color: #f1f5f9 !important;
            border-top: 2px solid #cbd5e1;
          }
          
          .payroll-report-page .payroll-total-row .payroll-td {
            font-weight: 600;
            border-bottom: none;
            padding: 16px 12px;
          }
          
          .payroll-report-page .payroll-person-name {
            font-weight: 500;
            color: #1e293b;
            margin-bottom: 2px;
          }
          
          .payroll-report-page .payroll-person-type {
            font-size: 11px;
            color: #64748b;
            font-style: italic;
          }
          
          .payroll-report-page .payroll-report-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
          }
          
          .payroll-report-page .payroll-report-subtitle {
            font-size: 16px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 12px;
          }
          
          .payroll-report-page .payroll-report-info {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 24px;
          }
        }
        
        /* ESTILOS DE IMPRESSÃO - MANTÉM OS ORIGINAIS DO index.css */
        @media print {
          .payroll-report-page .print-section {
            background: white !important;
            color: black !important;
          }
          
          .payroll-report-page .payroll-table-container {
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 1rem 0 !important;
            box-shadow: none !important;
          }
          
          .payroll-report-page .payroll-table {
            width: 100% !important;
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            table-layout: auto !important;
            font-size: 11px !important;
          }
          
          .payroll-report-page .payroll-th {
            border: 1px solid #e5e7eb !important;
            padding: 10px 8px !important;
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-weight: bold !important;
            text-align: left !important;
            color: black !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          
          .payroll-report-page .payroll-td {
            border: 1px solid #e5e7eb !important;
            padding: 8px 10px !important;
            page-break-inside: avoid !important;
            color: black !important;
            line-height: 1.5 !important;
            font-size: 11px !important;
          }
          
          .payroll-report-page .payroll-row-even {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .payroll-report-page .payroll-row-odd {
            background-color: white !important;
          }
          
          .payroll-report-page .payroll-total-row {
            border-top: 2px solid #333 !important;
            background-color: white !important;
          }
          
          .payroll-report-page .payroll-total-row .payroll-td {
            border-top: 2px solid #333 !important;
            padding: 10px 6px !important;
            font-weight: bold !important;
            background-color: white !important;
            color: black !important;
            line-height: 1.6 !important;
            font-size: 11px !important;
          }
          
          .payroll-report-page .payroll-person-name {
            font-weight: bold !important;
            color: black !important;
            margin-bottom: 0 !important;
            font-size: 11px !important;
          }
          
          .payroll-report-page .payroll-person-type {
            font-size: 10px !important;
            color: #22c55e !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-style: italic !important;
            margin-top: 2px !important;
          }
          
          .payroll-report-page .payroll-report-title {
            font-size: 16px !important;
            font-weight: bold !important;
            margin-bottom: 0.25rem !important;
            color: black !important;
          }
          
          .payroll-report-page .payroll-report-subtitle {
            font-size: 14px !important;
            font-weight: 600 !important;
            margin-bottom: 0.5rem !important;
            color: black !important;
          }
          
          .payroll-report-page .payroll-report-info {
            font-size: 11px !important;
            color: black !important;
            margin-top: 0.5rem !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>

      {/* Botões de ação - ocultos na impressão */}
      <div className="no-print sticky top-0 z-10 bg-background border-b p-4 flex justify-between">
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex gap-2">
          {selectedEvent && (
            <Button onClick={handleGoToEvent} variant="secondary">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ver Evento</span>
              <span className="sm:hidden">Evento</span>
            </Button>
          )}
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Conteúdo do relatório */}
      <PayrollPrintTable
        teamName={activeTeam?.name}
        event={selectedEvent as any}
        details={payrollDetails as any}
        showPartialPaid={true}
      />
    </div>
  );
};
