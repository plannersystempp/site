import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EventDetail {
  eventId: string;
  eventName: string;
  workDays: number;
  cachePay: number;
  overtimePay: number;
}

interface MonthlyPayrollDetail {
  personnelId: string;
  personName: string;
  baseSalary: number;
  totalCachePay: number;
  totalOvertimePay: number;
  totalPay: number;
  eventCount: number;
  totalWorkDays: number;
  paidAmount: number;
  pendingAmount: number;
  isPaid: boolean;
  events: EventDetail[];
}

interface MonthlyPayrollTableProps {
  details: MonthlyPayrollDetail[];
  onMarkAsPaid?: (personnelId: string, amount: number) => void;
  canManagePayroll: boolean;
}

export const MonthlyPayrollTable: React.FC<MonthlyPayrollTableProps> = ({
  details,
  onMarkAsPaid,
  canManagePayroll,
}) => {
  const isMobile = useIsMobile();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (personnelId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(personnelId)) {
      newExpanded.delete(personnelId);
    } else {
      newExpanded.add(personnelId);
    }
    setExpandedRows(newExpanded);
  };

  if (details.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Nenhum funcionário fixo com alocações neste mês
        </CardContent>
      </Card>
    );
  }

  const totalGeral = details.reduce((sum, d) => sum + d.totalPay, 0);
  const totalPago = details.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalPendente = details.reduce((sum, d) => sum + d.pendingAmount, 0);

  return (
    <div className="space-y-4">
      {/* Resumo Geral */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-4'}`}>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total a Pagar</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalGeral)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Pago</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pendente</div>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPendente)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Funcionários */}
      <div className="space-y-3">
        {details.map(detail => (
          <Card key={detail.personnelId}>
            <Collapsible
              open={expandedRows.has(detail.personnelId)}
              onOpenChange={() => toggleRow(detail.personnelId)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg truncate">{detail.personName}</h3>
                      {detail.isPaid ? (
                        <Badge variant="default" className="bg-green-600">Pago</Badge>
                      ) : (
                        <Badge variant="destructive">Pendente</Badge>
                      )}
                    </div>
                    
                    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 text-sm`}>
                      <div>
                        <span className="text-muted-foreground">Salário Base:</span>
                        <div className="font-medium">{formatCurrency(detail.baseSalary)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cachês:</span>
                        <div className="font-medium">{formatCurrency(detail.totalCachePay)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Horas Extras:</span>
                        <div className="font-medium">{formatCurrency(detail.totalOvertimePay)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <div className="font-bold text-primary">{formatCurrency(detail.totalPay)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span>{detail.eventCount} evento(s)</span>
                      <span>•</span>
                      <span>{detail.totalWorkDays} dia(s) trabalhado(s)</span>
                    </div>

                    {detail.paidAmount > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Já pago: </span>
                        <span className="font-medium text-green-600">{formatCurrency(detail.paidAmount)}</span>
                        <span className="text-muted-foreground"> | Pendente: </span>
                        <span className="font-medium text-amber-600">{formatCurrency(detail.pendingAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {expandedRows.has(detail.personnelId) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    {canManagePayroll && !detail.isPaid && onMarkAsPaid && (
                      <Button
                        size="sm"
                        onClick={() => onMarkAsPaid(detail.personnelId, detail.pendingAmount)}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Pagar
                      </Button>
                    )}
                  </div>
                </div>

                <CollapsibleContent className="mt-4">
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 text-sm">Detalhamento por Evento:</h4>
                    <div className="space-y-2">
                      {detail.events.map(event => (
                        <div
                          key={event.eventId}
                          className="bg-muted/50 p-3 rounded-lg text-sm"
                        >
                          <div className="font-medium mb-1">{event.eventName}</div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span>Dias: </span>
                              <span className="font-medium text-foreground">{event.workDays}</span>
                            </div>
                            <div>
                              <span>Cachê: </span>
                              <span className="font-medium text-foreground">
                                {formatCurrency(event.cachePay)}
                              </span>
                            </div>
                            <div>
                              <span>HE: </span>
                              <span className="font-medium text-foreground">
                                {formatCurrency(event.overtimePay)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};
