import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { formatDateBR } from '@/utils/dateUtils';
import { usePayrollData } from '@/components/payroll/usePayrollData';
import { Badge } from '@/components/ui/badge';

export const PayrollReportPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { events } = useEnhancedData();
  const { activeTeam, userRole } = useTeam();
  const { payrollDetails, pixKeys, loading } = usePayrollData(eventId || '');

  const selectedEvent = events.find(e => e.id === eventId);
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

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

  // Cálculos de totais
  const totalGeral = payrollDetails.reduce((sum, item) => sum + item.totalPay, 0);
  const totalPago = payrollDetails.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalPendente = payrollDetails.reduce((sum, item) => sum + item.pendingAmount, 0);
  const totalDias = payrollDetails.reduce((sum, item) => sum + item.workDays, 0);
  const totalHorasExtras = payrollDetails.reduce((sum, item) => sum + item.totalOvertimeHours, 0);
  const totalAusencias = payrollDetails.reduce((sum, item) => sum + item.absencesCount, 0);

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
          Imprimir Relatório
        </Button>
      </div>

      {/* Conteúdo do relatório */}
      <div className="print-section p-8 max-w-[210mm] mx-auto">
        {/* Cabeçalho com Logo */}
        <div className="mb-8 border-b pb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <img 
                src="/icons/icon-192x192.png" 
                alt="Logo SIGE" 
                className="w-16 h-16 rounded-lg"
              />
              <div>
                <h1 className="text-3xl font-bold text-primary">Relatório de Folha de Pagamento</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerado em: {new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Informações da Empresa */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">{activeTeam?.name}</h2>
            {activeTeam?.cnpj && (
              <p className="text-sm text-muted-foreground">CNPJ: {activeTeam.cnpj}</p>
            )}
          </div>
        </div>

        {/* Informações do Evento */}
        <div className="mb-6 bg-primary/5 p-4 rounded-lg border border-primary/10">
          <h3 className="font-bold text-xl mb-3 text-primary">{selectedEvent?.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {selectedEvent?.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  <strong>Início:</strong> {formatDateBR(selectedEvent.start_date)}
                </span>
              </div>
            )}
            {selectedEvent?.end_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  <strong>Término:</strong> {formatDateBR(selectedEvent.end_date)}
                </span>
              </div>
            )}
            {selectedEvent?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>
                  <strong>Local:</strong> {selectedEvent.location}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>Profissionais:</strong> {payrollDetails.length}
              </span>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total Bruto</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalGeral)}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900">
            <div className="text-sm text-green-700 dark:text-green-300 mb-1">Total Pago</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPago)}
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-900">
            <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Pendente</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(totalPendente)}
            </div>
          </div>
        </div>

        {/* Estatísticas Adicionais */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="bg-muted/30 p-3 rounded">
            <div className="text-muted-foreground mb-1">Total de Dias Trabalhados</div>
            <div className="text-xl font-semibold">{totalDias} dias</div>
          </div>
          <div className="bg-muted/30 p-3 rounded">
            <div className="text-muted-foreground mb-1">Total de Horas Extras</div>
            <div className="text-xl font-semibold">{totalHorasExtras.toFixed(1)}h</div>
          </div>
          <div className="bg-muted/30 p-3 rounded">
            <div className="text-muted-foreground mb-1">Total de Ausências</div>
            <div className="text-xl font-semibold">{totalAusencias}</div>
          </div>
        </div>

        {/* Tabela Detalhada por Profissional */}
        <h3 className="font-bold text-lg mb-3 mt-8">Detalhamento por Profissional</h3>
        
        {payrollDetails.map((person, personIndex) => (
          <div key={person.id} className="mb-8 border rounded-lg overflow-hidden">
            {/* Cabeçalho da Pessoa */}
            <div className="bg-muted/50 p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg">{person.personName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={person.personType === 'fixo' ? 'default' : 'secondary'}>
                      {person.personType === 'fixo' ? 'Funcionário Fixo' : 'Freelancer'}
                    </Badge>
                    <Badge variant={person.paid ? 'default' : 'destructive'}>
                      {person.paid ? '✓ Pago' : '⚠ Pendente'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(person.totalPay)}
                  </div>
                  {person.pendingAmount > 0 && (
                    <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      Pendente: {formatCurrency(person.pendingAmount)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detalhamento de Cálculos */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="font-semibold text-sm mb-2">Dias e Horas</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dias trabalhados:</span>
                      <span className="font-medium">{person.workDays} dias</span>
                    </div>
                    {person.regularHours > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horas regulares:</span>
                        <span className="font-medium">{person.regularHours.toFixed(1)}h</span>
                      </div>
                    )}
                    {person.totalOvertimeHours > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horas extras:</span>
                        <span className="font-medium">{person.totalOvertimeHours.toFixed(1)}h</span>
                      </div>
                    )}
                    {person.absencesCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-600 dark:text-red-400">Ausências:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {person.absencesCount} {person.absencesCount === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-sm mb-2">Composição do Pagamento</h5>
                  <div className="space-y-1 text-sm">
                    {person.baseSalary > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salário base:</span>
                        <span className="font-medium">{formatCurrency(person.baseSalary)}</span>
                      </div>
                    )}
                    {person.cachePay > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Cachê ({person.workDays}d × {formatCurrency(person.hasEventSpecificCache ? person.eventSpecificCacheRate : person.cacheRate)}):
                        </span>
                        <span className="font-medium">{formatCurrency(person.cachePay)}</span>
                      </div>
                    )}
                    {person.overtimePay > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          H. Extras ({person.totalOvertimeHours.toFixed(1)}h × {formatCurrency(person.overtimeRate)}):
                        </span>
                        <span className="font-medium">{formatCurrency(person.overtimePay)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t mt-2">
                      <span className="font-semibold">Total Bruto:</span>
                      <span className="font-bold text-primary">{formatCurrency(person.totalPay)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Histórico de Pagamentos */}
              {person.paymentHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-semibold text-sm mb-2">Histórico de Pagamentos</h5>
                  <div className="space-y-2">
                    {person.paymentHistory.map((payment, idx) => (
                      <div key={payment.id} className="flex justify-between items-center text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                        <div>
                          <span className="font-medium">Pagamento #{idx + 1}</span>
                          <span className="text-muted-foreground ml-2">
                            {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                          </span>
                          {payment.notes && (
                            <div className="text-xs text-muted-foreground mt-1">{payment.notes}</div>
                          )}
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ausências Detalhadas */}
              {person.absences.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-semibold text-sm mb-2 text-red-600 dark:text-red-400">
                    Ausências Registradas
                  </h5>
                  <div className="space-y-2">
                    {person.absences.map((absence) => (
                      <div key={absence.id} className="flex justify-between items-start text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded">
                        <div>
                          <span className="font-medium">
                            {new Date(absence.work_date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            • Registrado por: {absence.logged_by_name}
                          </span>
                          {absence.notes && (
                            <div className="text-xs text-muted-foreground mt-1">{absence.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dados PIX (apenas para admin) */}
              {isAdmin && pixKeys[person.personnelId] && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-semibold text-sm mb-2">Dados para Pagamento</h5>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-muted-foreground">Chave PIX:</span>
                      <span className="font-mono font-medium">{pixKeys[person.personnelId]}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Rodapé */}
        <div className="mt-8 pt-6 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Relatório gerado automaticamente pelo Sistema SIGE - Sistema Integrado de Gestão de Eventos</p>
            <p>• Valores calculados com base nas alocações, registros de trabalho e ausências do evento</p>
            <p>• Este documento possui validade apenas como comprovante de cálculo interno</p>
            {isAdmin && (
              <p className="text-blue-600 dark:text-blue-400">
                • Dados PIX exibidos apenas para usuários com permissão de administrador
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
