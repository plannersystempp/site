
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useToast } from '@/hooks/use-toast';
import { Zap, Clock, Calendar, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    workDate: new Date().toISOString().split('T')[0],
    overtimeHours: 0,
    notes: ''
  });

  const handleQuickOvertime = async () => {
    if (!overtimeData.eventId || !overtimeData.personnelId || !overtimeData.overtimeHours) {
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
        workDate: new Date().toISOString().split('T')[0],
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
                onValueChange={(value) => setOvertimeData(prev => ({ ...prev, personnelId: value }))}
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
              <Input
                id="workDate"
                type="date"
                value={overtimeData.workDate}
                onChange={(e) => setOvertimeData(prev => ({ ...prev, workDate: e.target.value }))}
              />
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
