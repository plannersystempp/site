import React, { useMemo } from 'react';
import { formatCurrency } from '@/utils/formatters';
import { formatPeriodDays, generateDateArray, formatDateBR } from '@/utils/dateUtils';

type EventInfo = {
  name?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  setup_start_date?: string;
  setup_end_date?: string;
  payment_due_date?: string;
  status?: string;
};

type PayrollDetail = {
  personName: string;
  personType: string;
  workDays: string[] | number;
  workDaysList?: string[];
  totalOvertimeHours: number | string;
  cachePay: number;
  overtimePay: number;
  totalPay: number;
  paidAmount?: number;
  pendingAmount?: number;
  cacheRate?: number;
  eventSpecificCacheRate?: number;
  hasEventSpecificCache?: boolean;
};

interface PayrollPrintTableProps {
  teamName?: string;
  event?: EventInfo | null;
  details: PayrollDetail[];
  showPartialPaid?: boolean;
}

export const PayrollPrintTable: React.FC<PayrollPrintTableProps> = ({ teamName, event, details, showPartialPaid }) => {
  const totalGeral = details.reduce((sum, d) => sum + (d.totalPay || 0), 0);
  const hasPartialPayments = showPartialPaid && details.some(d => (d.paidAmount || 0) > 0 && (d.pendingAmount || 0) > 0);
  const totalPagoParcial = details
    .filter(d => (d.paidAmount || 0) > 0 && (d.pendingAmount || 0) > 0)
    .reduce((sum, d) => sum + (d.paidAmount || 0), 0);
  const totalPendente = details.reduce((sum, d) => sum + (d.pendingAmount || 0), 0);

  const formatDate = (d?: string) => (d ? formatDateBR(d) : '—');

  // Ordenar alfabeticamente por nome, respeitando pt-BR e acentuação
  const detalhesOrdenados = useMemo(() => {
    return [...details].sort((a, b) =>
      (a.personName || '').localeCompare((b.personName || ''), 'pt-BR', { sensitivity: 'base' })
    );
  }, [details]);

  return (
    <div className="payroll-report-page print-section p-8 max-w-[210mm] mx-auto">
      {/* Cabeçalho Completo */}
      <div className="mb-6">
        <div className="flex justify-center mb-4">
          <img 
            src="/icons/logo_plannersystem.png" 
            alt="PlannerSystem Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
        <h2 className="payroll-report-subtitle text-center">Relatório de Folha de Pagamento</h2>
        <div className="payroll-report-info">
          <div style={{fontSize: '18px', fontWeight: 'bold', color: '#1e40af', marginBottom: '8px', textAlign: 'center'}}>
            {teamName}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <div><strong>Evento:</strong> {event?.name || '—'}</div>
            <div><strong>Local:</strong> {event?.location || '—'}</div>
            <div><strong>Início:</strong> {formatDate(event?.start_date)} <strong>Fim:</strong> {formatDate(event?.end_date)}</div>
            <div><strong>Montagem:</strong> {formatDate(event?.setup_start_date)} → {formatDate(event?.setup_end_date)}</div>
            <div><strong>Vencimento Pagamento:</strong> {formatDate(event?.payment_due_date)}</div>
            <div><strong>Status:</strong> {event?.status || '—'}</div>
            <div><strong>Gerado em:</strong> {new Date().toLocaleDateString('pt-BR')}</div>
          </div>
        </div>
      </div>

      {/* Tabela Resumo por Profissional */}
      <div className="payroll-table-container">
        <table className="payroll-table">
          <thead>
            <tr>
              <th className="payroll-th">Nome</th>
              <th className="payroll-th text-right">Cachê dia (R$)</th>
              <th className="payroll-th text-center">Dias de trabalho</th>
              <th className="payroll-th text-center">Qtd Dias</th>
              <th className="payroll-th text-center">H. Extras (h)</th>
              <th className="payroll-th text-right">H. Extras (R$)</th>
              <th className="payroll-th text-right">Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {detalhesOrdenados.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'payroll-row-even' : 'payroll-row-odd'}>
                <td className="payroll-td">
                  <div className="payroll-person-name">{item.personName}</div>
                  <div className="payroll-person-type">{item.personType}</div>
                </td>
                <td className="payroll-td text-right">{formatCurrency((item.eventSpecificCacheRate ?? item.cacheRate ?? 0))}</td>
                <td className="payroll-td text-center">{
                  (() => {
                    const list = item.workDaysList || (Array.isArray(item.workDays) ? item.workDays as string[] : undefined);
                    if (list?.length) return formatPeriodDays(list);
                    if (event?.start_date && event?.end_date) {
                      const range = generateDateArray(event.start_date, event.end_date);
                      const count = typeof item.workDays === 'number' ? item.workDays : range.length;
                      return formatPeriodDays(range.slice(0, count));
                    }
                    return '—';
                  })()
                }</td>
                <td className="payroll-td text-center">{
                  (() => {
                    if (typeof item.workDays === 'number') return item.workDays;
                    const list = item.workDaysList || (Array.isArray(item.workDays) ? (item.workDays as string[]) : undefined);
                    if (list?.length) return list.length;
                    if (event?.start_date && event?.end_date) {
                      const range = generateDateArray(event.start_date, event.end_date);
                      return range.length;
                    }
                    return 0;
                  })()
                }</td>
                <td className="payroll-td text-center">{item.totalOvertimeHours ?? 0}</td>
                <td className="payroll-td text-right">{formatCurrency(item.overtimePay)}</td>
                <td className="payroll-td text-right">{formatCurrency(item.totalPay)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="payroll-total-row">
              <td className="payroll-td font-bold">TOTAL GERAL:</td>
              <td className="payroll-td"></td>
              <td className="payroll-td"></td>
              <td className="payroll-td text-right"></td>
              <td className="payroll-td text-right"></td>
              <td className="payroll-td text-right"></td>
              <td className="payroll-td text-right font-bold">{formatCurrency(totalGeral)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Observações e Detalhes Adicionais */}
      <div className="mt-3 text-xs text-muted-foreground">
        <p>Este relatório contém: dados do evento, dias trabalhados por profissional, horas extras, valores de cachê e totais.</p>
      </div>
    </div>
  );
};

export default PayrollPrintTable;