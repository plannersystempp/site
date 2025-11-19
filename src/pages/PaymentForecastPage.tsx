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
    <div className="p-4 space-y-4 print:p-0 print:bg-white print:text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Previsão de Pagamentos (Próximas Semanas)</h1>
        <div className="flex items-center gap-2 print:hidden">
          <label htmlFor="weeks" className="text-sm text-muted-foreground">Semanas à frente</label>
          <select
            id="weeks"
            className="border rounded px-2 py-1 text-sm bg-background dark:bg-slate-900"
            value={weeksAhead}
            onChange={(e) => setWeeksAhead(Number(e.target.value))}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
          <Button
            aria-label="Imprimir relatório"
            variant="secondary"
            className="ml-2"
            onClick={handlePrintReport}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Relatório
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="p-6">Carregando previsão...</div>
      )}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="p-6">
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
          <Card key={`${week.weekStart}_${week.weekEnd}`}>
            <CardContent className="p-0">
              <div
                className={`px-4 py-3 flex items-center justify-between border-b
                ${isTopWeek ? 'bg-amber-100 dark:bg-amber-300/20' : 'bg-slate-100 dark:bg-slate-800/60'}`}
              >
                <div className="font-medium">
                  Pagamento de Freelas - Semana de {formatDateShort(week.weekStart)} a {formatDateShort(week.weekEnd)}
                </div>
                <div className="font-semibold">Total: {formatCurrency(week.totalAmount)}</div>
              </div>

              {/* Seção de Eventos */}
              {eventos.length > 0 && (
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                      <TableHead colSpan={6} className="text-left">Eventos</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="w-[120px]">Tipo</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead className="w-[200px]">Local</TableHead>
                      <TableHead className="w-[120px]">Vencimento</TableHead>
                      <TableHead className="w-[160px] text-right">Total a Pagar</TableHead>
                      <TableHead>Obs.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventosSorted.map((item) => (
                      <TableRow key={`${item.kind}_${item.id}`}>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {item.kind}
                          </span>
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.location || '-'}</TableCell>
                        <TableCell>{formatDateShort(item.dueDate)}</TableCell>
                        <TableCell className="font-medium text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.notes || ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Seção de Pagamentos Avulsos */}
              {avulsos.length > 0 && (
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                      <TableHead colSpan={6} className="text-left">Pagamentos Avulsos</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="w-[120px]">Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[200px]">Local</TableHead>
                      <TableHead className="w-[120px]">Vencimento</TableHead>
                      <TableHead className="w-[160px] text-right">Total a Pagar</TableHead>
                      <TableHead>Obs.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {avulsosSorted.map((item) => (
                      <TableRow key={`${item.kind}_${item.id}`}>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {item.kind}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.name}
                          {item.personnelName ? (
                            <span className="block text-xs text-muted-foreground">{item.personnelName}</span>
                          ) : null}
                        </TableCell>
                        <TableCell>{item.location || '-'}</TableCell>
                        <TableCell>{formatDateShort(item.dueDate)}</TableCell>
                        <TableCell className="font-medium text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.notes || ''}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-semibold">Total da Semana</TableCell>
                      <TableCell className="font-semibold text-right">{formatCurrency(week.totalAmount)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );
      })}

      {(data && data.length > 0) && (
        <div className="flex items-center justify-end text-sm text-muted-foreground">
          <span>Total geral no período: </span>
          <span className="ml-2 font-medium">{formatCurrency(totalAllWeeks)}</span>
        </div>
      )}
    </div>
  );
};

export default PaymentForecastPage;