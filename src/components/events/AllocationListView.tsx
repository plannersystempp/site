import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { type Assignment } from '@/contexts/EnhancedDataContext';
import { Clock, Edit2, Trash2, User, Calendar } from 'lucide-react';
import { getSimplifiedName } from '@/utils/nameUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AllocationListViewProps {
  assignments: Assignment[];
  onLaunchHours: (assignmentId: string) => void;
  onEditAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

export const AllocationListView: React.FC<AllocationListViewProps> = ({
  assignments,
  onLaunchHours,
  onEditAssignment,
  onDeleteAssignment
}) => {
  const { personnel, workLogs } = useEnhancedData();
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
          <User className="w-4 md:w-5 h-4 md:h-5" />
          Pessoal Alocado ({assignments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-medium text-sm">Nome</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-sm">Função</th>
                  <th className="text-center p-3 sm:p-4 font-medium text-sm">Dias</th>
                  <th className="text-center p-3 sm:p-4 font-medium text-sm">H. Extras</th>
                  <th className="text-right p-3 sm:p-4 font-medium text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => {
                  const person = personnel.find(p => p.id === assignment.personnel_id);
                  const assignmentWorkLogs = workLogs.filter(log => 
                    log.employee_id === assignment.personnel_id && log.event_id === assignment.event_id
                  );
                  const totalOvertimeHours = assignmentWorkLogs.reduce((sum, log) => sum + log.overtime_hours, 0);

                  return (
                    <tr key={assignment.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-2 md:p-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-xs md:text-sm">
                              {person ? getSimplifiedName(person.name) : 'Pessoa não encontrada'}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {person?.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 md:p-4">
                        <Badge variant="outline" className="text-xs">
                          {assignment.function_name}
                        </Badge>
                      </td>
                      <td className="p-2 md:p-4 text-center">
                        <span className="font-medium text-xs md:text-sm">{assignment.work_days.length}</span>
                      </td>
                      <td className="p-2 md:p-4 text-center">
                        <span className="font-medium text-xs md:text-sm">{totalOvertimeHours}h</span>
                      </td>
                      <td className="p-2 md:p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onLaunchHours(assignment.id)}
                            className="text-xs h-8 px-2 md:px-3"
                          >
                            <Clock className="w-3 h-3 md:mr-1" />
                            <span className="hidden md:inline">Horas</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditAssignment(assignment)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmation(assignment.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile List */}
        <div className="md:hidden space-y-2 p-2">
          {assignments.map((assignment) => {
            const person = personnel.find(p => p.id === assignment.personnel_id);
            const assignmentWorkLogs = workLogs.filter(log => 
              log.employee_id === assignment.personnel_id && log.event_id === assignment.event_id
            );
            const totalOvertimeHours = assignmentWorkLogs.reduce((sum, log) => sum + log.overtime_hours, 0);

            return (
              <div key={assignment.id} className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {person ? getSimplifiedName(person.name) : 'Pessoa não encontrada'}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant={person?.type === 'fixo' ? 'default' : 'secondary'} className="text-xs px-1 py-0">
                          {person?.type === 'fixo' ? 'Fixo' : 'Freelancer'}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {assignment.function_name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditAssignment(assignment)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmation(assignment.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Stats and Action */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{assignment.work_days.length} dias</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{totalOvertimeHours}h extras</span>
                    </div>
                  </div>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLaunchHours(assignment.id)}
                    className="h-8 px-3 text-xs"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Horas
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir permanentemente esta alocação. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirmation) {
                  onDeleteAssignment(deleteConfirmation);
                  setDeleteConfirmation(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};