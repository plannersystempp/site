import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, FileText, ArrowLeft, Calendar } from 'lucide-react';
import { NoTeamSelected } from '@/components/shared/NoTeamSelected';
import { PayrollList } from './PayrollList';
import { usePayrollData } from './usePayrollData';
import { usePayrollActions } from './usePayrollActions';
import { formatDateBR } from '@/utils/dateUtils';

export const PayrollEventView: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { events } = useEnhancedData();
  const { activeTeam, userRole } = useTeam();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const [paymentFilter, setPaymentFilter] = useState<'todos' | 'pendentes' | 'pagos'>('todos');

  // Hooks personalizados
  const { payrollDetails, pixKeys, loading, setEventData } = usePayrollData(eventId || '');
  const { handleRegisterPayment, handleRegisterPartialPayment, handleCancelPayment } = usePayrollActions(eventId || '', setEventData);

  // Filtrar dados de acordo com o filtro selecionado
  const filteredPayrollDetails = useMemo(() => {
    if (paymentFilter === 'todos') return payrollDetails;
    if (paymentFilter === 'pendentes') return payrollDetails.filter(item => !item.paid);
    if (paymentFilter === 'pagos') return payrollDetails.filter(item => item.paid);
    return payrollDetails;
  }, [payrollDetails, paymentFilter]);

  const canManagePayroll = userRole === 'admin';
  const selectedEvent = events.find(e => e.id === eventId);

  const handleOpenReport = () => {
    if (eventId) {
      navigate(`/app/folha/relatorio/${eventId}`);
    }
  };

  const handleBackToSelection = () => {
    navigate('/app/folha');
  };

  if (!activeTeam) {
    return (
      <NoTeamSelected
        title="Gestão de Folha de Pagamento"
        description="Selecione uma equipe para gerenciar a folha de pagamento."
      />
    );
  }

  if (!canManagePayroll) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Apenas administradores podem gerenciar a folha de pagamento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="w-full max-w-full p-3 sm:p-4 md:p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Evento não encontrado.</p>
            <Button onClick={handleBackToSelection} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Seleção
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Cabeçalho com informações do evento */}
      <div className="space-y-3">
        <Button 
          variant="ghost" 
          onClick={handleBackToSelection}
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à Seleção
        </Button>
        
        <div className="space-y-1">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold leading-tight`}>
            Folha de Pagamento
          </h1>
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} text-muted-foreground`}>
            {selectedEvent.name}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {selectedEvent.start_date && formatDateBR(selectedEvent.start_date)}
              {selectedEvent.end_date && selectedEvent.start_date !== selectedEvent.end_date && 
                ` - ${formatDateBR(selectedEvent.end_date)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Card de Folha de Pagamento */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              <DollarSign className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span>Detalhes da Folha</span>
            </CardTitle>
            <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex gap-2'}`}>
              <Button 
                onClick={handleOpenReport}
                disabled={payrollDetails.length === 0}
                className={`${isMobile ? 'w-full' : 'w-auto'} text-sm`}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isMobile ? 'Imprimir' : 'Imprimir Relatório'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as 'todos' | 'pendentes' | 'pagos')} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
            </TabsList>
            <TabsContent value={paymentFilter} className="mt-4">
              <PayrollList
                payrollDetails={filteredPayrollDetails}
                loading={loading}
                pixKeys={pixKeys}
                onRegisterPayment={handleRegisterPayment}
                onRegisterPartialPayment={handleRegisterPartialPayment}
                onCancelPayment={handleCancelPayment}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
