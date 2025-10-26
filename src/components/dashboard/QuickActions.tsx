
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useToast } from '@/hooks/use-toast';
import { Zap, Clock, Calendar, Users, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isDateWithinEventPeriod, isDateInAllocation, formatDateBR } from '@/utils/dateValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuickOvertimeData {
  eventId: string;
  personnelId: string;
  workDate: string;
  overtimeHours: number;
  notes: string;
}

export const QuickActions: React.FC = () => {
  const { events, personnel, assignments, addWorkLog } = useEnhancedData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [overtimeData, setOvertimeData] = useState<QuickOvertimeData>({
    eventId: '',
    personnelId: '',
    workDate: '',
    overtimeHours: 0,
    notes: ''
  });

  const handleQuickOvertime = async () => {
    if (!overtimeData.eventId || !overtimeData.personnelId || !overtimeData.workDate || !overtimeData.overtimeHours) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validação de limite diário de horas extras (0 a 8h)
    if (overtimeData.overtimeHours < 0 || overtimeData.overtimeHours > 8) {
      toast({
        title: "Horas inválidas",
        description: "Informe um valor entre 0 e 8 horas.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Searching for assignment with:', {
        personnelId: overtimeData.personnelId,
        eventId: overtimeData.eventId,
        availableAssignments: assignments
      });

      const assignment = assignments.find(a => 
        a.personnel_id === overtimeData.personnelId && 
        a.event_id === overtimeData.eventId
      );

      console.log('Found assignment:', assignment);

      if (!assignment) {
        toast({
          title: "Erro", 
          description: "Funcionário não está alocado neste evento. Aloque o funcionário primeiro.",
          variant: "destructive"
        });
        return;
      }

      // Buscar evento completo
      const event = events.find(e => e.id === overtimeData.eventId);

      if (!event) {
        toast({
          title: "Erro",
          description: "Evento não encontrado.",
          variant: "destructive"
        });
        return;
      }

      // VALIDAÇÃO 1: Verificar se a data está dentro do período do evento
      if (!isDateWithinEventPeriod(overtimeData.workDate, event)) {
        toast({
          title: "Data inválida",
          description: `A data deve estar entre ${formatDateBR(event.start_date)} e ${formatDateBR(event.end_date)}.`,
          variant: "destructive"
        });
        return;
      }

      // VALIDAÇÃO 2: Verificar se a data está nos work_days da alocação
      if (!isDateInAllocation(overtimeData.workDate, assignment.work_days)) {
        toast({
          title: "Data inválida",
          description: "O funcionário não está alocado para trabalhar nesta data.",
          variant: "destructive"
        });
        return;
      }

      console.log('Adding work log with employee_id:', assignment.personnel_id);

      await addWorkLog({
        employee_id: assignment.personnel_id,
        event_id: overtimeData.eventId,
        work_date: overtimeData.workDate,
        hours_worked: 12,
        overtime_hours: overtimeData.overtimeHours,
        total_pay: 0
      });

      toast({
        title: "Sucesso",
        description: "Hora extra registrada com sucesso!",
      });

      setShowOvertimeModal(false);
      setOvertimeData({
        eventId: '',
        personnelId: '',
        workDate: '',
        overtimeHours: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error adding overtime:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar hora extra. Verifique se o funcionário está alocado no evento.",
        variant: "destructive"
      });
    }
  };

  const quickActions = [
    {
      title: "Hora Extra",
      icon: <Clock className="h-5 w-5" />,
      action: () => setShowOvertimeModal(true),
      color: "text-orange-600"
    },
    {
      title: "Novo Evento",
      icon: <Calendar className="h-5 w-5" />,
      action: () => navigate('/app/eventos'),
      color: "text-blue-600"
    },
    {
      title: "Pessoal",
      icon: <Users className="h-5 w-5" />,
      action: () => navigate('/app/pessoal'),
      color: "text-green-600"
    },
    {
      title: "Folha",
      icon: <FileText className="h-5 w-5" />,
      action: () => navigate('/app/folha'),
      color: "text-purple-600"
    }
  ];

  const eventPersonnel = overtimeData.eventId 
    ? personnel.filter(p => 
        assignments.some(a => 
          a.personnel_id === p.id && 
          a.event_id === overtimeData.eventId
        )
      )
    : [];

  // Buscar o evento selecionado
  const selectedEvent = events.find(e => e.id === overtimeData.eventId);

  // Buscar a alocação do funcionário selecionado
  const selectedAssignment = overtimeData.eventId && overtimeData.personnelId
    ? assignments.find(a => 
        a.personnel_id === overtimeData.personnelId && 
        a.event_id === overtimeData.eventId
      )
    : null;

  // Obter apenas os dias válidos (dentro do evento E alocados)
  const validWorkDates = selectedAssignment && selectedEvent
    ? selectedAssignment.work_days.filter(date => 
        isDateWithinEventPeriod(date, selectedEvent)
      ).sort((a, b) => a.localeCompare(b))
    : [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Grade 2x2 para ações rápidas */}
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2 text-center hover:shadow-sm transition-all"
                onClick={action.action}
              >
                <div className={`flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </div>
                <span className="text-xs font-semibold leading-tight">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showOvertimeModal} onOpenChange={setShowOvertimeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lançar Hora Extra</DialogTitle>
            <DialogDescription>
              Registre horas extras de forma rápida
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event">Evento</Label>
              <Select
                value={overtimeData.eventId}
                onValueChange={(value) => setOvertimeData(prev => ({ ...prev, eventId: value, personnelId: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personnel">Funcionário</Label>
              <Select
                value={overtimeData.personnelId}
                onValueChange={(value) => setOvertimeData(prev => ({ ...prev, personnelId: value, workDate: '' }))}
                disabled={!overtimeData.eventId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !overtimeData.eventId ? "Selecione um evento primeiro" : 
                    eventPersonnel.length === 0 ? "Nenhum funcionário alocado" :
                    "Selecione um funcionário"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {eventPersonnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {overtimeData.eventId && eventPersonnel.length === 0 && (
                <p className="text-xs text-muted-foreground text-orange-600">
                  Nenhum funcionário alocado neste evento. Aloque funcionários primeiro.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workDate">Data</Label>
              <Select
                value={overtimeData.workDate}
                onValueChange={(value) => setOvertimeData(prev => ({ ...prev, workDate: value }))}
                disabled={!overtimeData.personnelId || validWorkDates.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !overtimeData.personnelId ? "Selecione um funcionário primeiro" :
                    validWorkDates.length === 0 ? "Nenhum dia disponível" :
                    "Selecione uma data"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {validWorkDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {formatDateBR(date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEvent && (
                <p className="text-xs text-muted-foreground">
                  📅 Período do evento: <span className="font-medium">{formatDateBR(selectedEvent.start_date)}</span> até <span className="font-medium">{formatDateBR(selectedEvent.end_date)}</span>
                </p>
              )}
              {validWorkDates.length > 0 && (
                <p className="text-xs text-blue-600">
                  ✅ {validWorkDates.length} dia(s) disponível(is) para lançamento
                </p>
              )}
              {selectedAssignment && validWorkDates.length === 0 && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Este funcionário não possui dias de trabalho alocados neste evento ou os dias estão fora do período.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtimeHours">Horas Extras</Label>
              <Input
                id="overtimeHours"
                type="number"
                min="0"
                max="8"
                step="0.5"
                value={overtimeData.overtimeHours}
                onChange={(e) => setOvertimeData(prev => ({ ...prev, overtimeHours: Number(e.target.value) }))}
                placeholder="Ex: 2.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Input
                id="notes"
                value={overtimeData.notes}
                onChange={(e) => setOvertimeData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Descrição das atividades..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleQuickOvertime} className="flex-1">
                Registrar
              </Button>
              <Button variant="outline" onClick={() => setShowOvertimeModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
