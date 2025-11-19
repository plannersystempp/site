// Idioma: pt-BR
// Idioma: pt-BR
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { usePaymentForecastQuery } from '@/hooks/queries/usePaymentForecastQuery';
import { formatCurrency } from '@/utils/formatters';
import { formatDateShort } from '@/utils/dateUtils';

export const PaymentForecastPage: React.FC = () => {
  const navigate = useNavigate();
  const [weeksAhead, setWeeksAhead] = useState(3);
  const { data, isLoading, error } = usePaymentForecastQuery({ weeksAhead });

  const handlePrintReport = () => {
    navigate(`/app/previsao-pagamentos/relatorio?weeks=${weeksAhead}`);
  };

  const totalAllWeeks = useMemo(() => {
    return (data || []).reduce((acc, w) => acc + w.totalAmount, 0);
  }, [data]);

  // Maior total semanal para destaque visual
  const maxWeekTotal = useMemo(() => {
    return (data || []).reduce((m, w) => Math.max(m, w.totalAmount), 0);
  }, [data]);

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Falha ao carregar previsão: {(error as any)?.message || 'erro desconhecido'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 print:p-0 print:bg-white print:text-black pb-20 md:pb-6">
      <style>{`
        @media (max-width: 768px) {
          .overflow-x-auto {
            position: relative;
          }
          .overflow-x-auto::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 30px;
            background: linear-gradient(to left, rgba(255,255,255,0.9), transparent);
            pointer-events: none;
          }
          .dark .overflow-x-auto::after {
            background: linear-gradient(to left, rgba(15,23,42,0.9), transparent);
          }
        }
      `}</style>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-semibold">Previsão de Pagamentos</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <label htmlFor="weeks" className="text-sm text-muted-foreground whitespace-nowrap">Semanas:</label>
            <select
              id="weeks"
              className="border rounded px-3 py-2 text-sm bg-background dark:bg-slate-900 flex-1 sm:flex-none"
              value={weeksAhead}
              onChange={(e) => setWeeksAhead(Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <Button
            aria-label="Imprimir relatório"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={handlePrintReport}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Relatório
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando previsão...</p>
        </div>
      )}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum pagamento pendente no período selecionado.</p>
          </CardContent>
        </Card>
      )}

      {(data || []).map((week) => {
        const eventos = week.items.filter(i => i.kind === 'evento');
        const avulsos = week.items.filter(i => i.kind === 'avulso');
        // Ordenar por data (asc) e depois por valor (desc)
        const parseDate = (d: string) => new Date(`${d}T12:00:00`).getTime();
        const byDateThenAmount = (a: any, b: any) => {
          const da = parseDate(a.dueDate);
          const db = parseDate(b.dueDate);
          if (da !== db) return da - db; // data ascendente
          return b.amount - a.amount;    // valor descendente
        };
        const eventosSorted = [...eventos].sort(byDateThenAmount);
        const avulsosSorted = [...avulsos].sort(byDateThenAmount);
        const isTopWeek = week.totalAmount === maxWeekTotal && maxWeekTotal > 0;
        return (
          <Card key={`${week.weekStart}_${week.weekEnd}`} className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className={`px-3 md:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b
                ${isTopWeek ? 'bg-amber-100 dark:bg-amber-300/20' : 'bg-slate-100 dark:bg-slate-800/60'}`}
              >
                <div className="font-medium text-sm md:text-base">
                  Semana de {formatDateShort(week.weekStart)} a {formatDateShort(week.weekEnd)}
                </div>
                <div className="text-lg md:text-xl font-semibold text-primary">{formatCurrency(week.totalAmount)}</div>
              </div>

              {/* Seção de Eventos */}
              {eventos.length > 0 && (
                <div className="overflow-x-auto -mx-3 md:mx-0">
                  <div className="min-w-[800px] md:min-w-0">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900">
                        <TableRow>
                          <TableHead colSpan={6} className="text-left font-semibold">Eventos</TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead className="w-[100px]">Tipo</TableHead>
                          <TableHead className="min-w-[180px]">Evento</TableHead>
                          <TableHead className="min-w-[150px]">Local</TableHead>
                          <TableHead className="w-[110px]">Vencimento</TableHead>
                          <TableHead className="w-[130px] text-right">Total a Pagar</TableHead>
                          <TableHead className="min-w-[150px]">Obs.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventosSorted.map((item) => (
                          <TableRow key={`${item.kind}_${item.id}`}>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap">
                                {item.kind}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.location || '-'}</TableCell>
                            <TableCell className="text-sm whitespace-nowrap">{formatDateShort(item.dueDate)}</TableCell>
                            <TableCell className="font-semibold text-right text-primary whitespace-nowrap">{formatCurrency(item.amount)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Seção de Pagamentos Avulsos */}
              {avulsos.length > 0 && (
                <div className="overflow-x-auto -mx-3 md:mx-0">
                  <div className="min-w-[800px] md:min-w-0">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900">
                        <TableRow>
                          <TableHead colSpan={6} className="text-left font-semibold">Pagamentos Avulsos</TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead className="w-[100px]">Tipo</TableHead>
                          <TableHead className="min-w-[180px]">Descrição</TableHead>
                          <TableHead className="min-w-[150px]">Local</TableHead>
                          <TableHead className="w-[110px]">Vencimento</TableHead>
                          <TableHead className="w-[130px] text-right">Total a Pagar</TableHead>
                          <TableHead className="min-w-[150px]">Obs.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {avulsosSorted.map((item) => (
                          <TableRow key={`${item.kind}_${item.id}`}>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap">
                                {item.kind}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>{item.name}</div>
                              {item.personnelName ? (
                                <span className="block text-xs text-muted-foreground mt-1">{item.personnelName}</span>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.location || '-'}</TableCell>
                            <TableCell className="text-sm whitespace-nowrap">{formatDateShort(item.dueDate)}</TableCell>
                            <TableCell className="font-semibold text-right text-primary whitespace-nowrap">{formatCurrency(item.amount)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                          <TableCell colSpan={4} className="text-right font-semibold">Total da Semana</TableCell>
                          <TableCell className="text-right font-bold text-primary whitespace-nowrap">{formatCurrency(week.totalAmount)}</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Total Geral */}
      {(data || []).length > 0 && (
        <Card className="border-2 border-primary/30">
          <CardContent className="p-4 md:p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Total Geral do Período</p>
            <p className="text-2xl md:text-3xl font-bold text-primary">{formatCurrency(totalAllWeeks)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Soma de {(data || []).length} {(data || []).length === 1 ? 'semana' : 'semanas'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentForecastPage;