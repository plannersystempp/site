
import React, { useState } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Clock, Trash2, User, Edit2, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getSimplifiedName } from '@/utils/nameUtils';
import { type Assignment, type Division } from '@/contexts/EnhancedDataContext';
import { useToast } from '@/hooks/use-toast';

interface DivisionCardProps {
  division: Division;
  assignments: Assignment[];
  availableDays: string[];
  onLaunchHours: (assignmentId: string) => void;
  onAddAllocation: (divisionId: string) => void;
  onEditAssignment: (assignment: Assignment) => void;
  onEditDivision: (division: Division) => void;
}

export const DivisionCard: React.FC<DivisionCardProps> = ({
  division,
  assignments,
  availableDays,
  onLaunchHours,
  onAddAllocation,
  onEditAssignment,
  onEditDivision
}) => {
  const { personnel, workLogs, deleteAssignment, deleteDivision } = useEnhancedData();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteAssignmentConfirmation, setDeleteAssignmentConfirmation] = useState<string | null>(null);

  const handleDeleteDivision = async () => {
    try {
      await deleteDivision(division.id);
      setShowDeleteDialog(false);
      toast({
        title: "Sucesso",
        description: "Divisão excluída com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting division:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir divisão",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0 sm:min-w-[200px]">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <CardTitle className="text-sm sm:text-base break-words">{division.name}</CardTitle>
          </div>
          
          {/* Responsive action buttons - wrap to new line when needed */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddAllocation(division.id)}
              className="h-9 w-9 sm:h-8 sm:w-auto sm:px-3 p-0 sm:p-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Adicionar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditDivision(division)}
              className="h-9 w-9 sm:h-8 sm:w-8 p-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="h-9 w-9 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {division.description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            {division.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {assignments.length === 0 ? (
          <div className="text-center py-6">
            <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma pessoa alocada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const person = personnel.find(p => p.id === assignment.personnel_id);
              const assignmentWorkLogs = workLogs.filter(log => 
                log.employee_id === assignment.personnel_id && log.event_id === assignment.event_id
              );
              const totalOvertimeHours = assignmentWorkLogs.reduce((sum, log) => sum + log.overtime_hours, 0);

              return (
                <div key={assignment.id} className="p-3 bg-muted/50 rounded-lg space-y-3">
                  {/* Header com nome e função */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-7 h-7 sm:w-6 sm:h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 sm:w-3 sm:h-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {person ? getSimplifiedName(person.name) : 'Pessoa não encontrada'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {assignment.function_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditAssignment(assignment)}
                        className="h-8 w-8 sm:h-6 sm:w-6 p-0"
                      >
                        <Edit2 className="w-4 h-4 sm:w-3 sm:h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteAssignmentConfirmation(assignment.id)}
                        className="h-8 w-8 sm:h-6 sm:w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Informações da alocação */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center bg-background/50 rounded-md p-2">
                      <div className="font-medium text-primary text-base sm:text-sm">{assignment.work_days?.length || 0}</div>
                      <div className="text-muted-foreground">
                        {(assignment.work_days?.length || 0) === 1 ? 'dia' : 'dias'}
                      </div>
                    </div>
                    <div className="text-center bg-background/50 rounded-md p-2">
                      <div className="font-medium text-orange-600 text-base sm:text-sm">{totalOvertimeHours}h</div>
                      <div className="text-muted-foreground">extras</div>
                    </div>
                  </div>

                  {/* Botão de lançar horas - Mobile optimized */}
                  <div className="flex justify-center pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLaunchHours(assignment.id)}
                      className="text-xs h-8 sm:h-6 px-3 sm:px-2 min-h-[44px] sm:min-h-0"
                    >
                      <Clock className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
                      Lançar Horas
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      {/* Delete Dialog - Outside of DropdownMenu */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Divisão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a divisão "{division.name}"? 
              Esta ação não pode ser desfeita e removerá todas as alocações desta divisão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDivision}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Assignment Confirmation Dialog */}
      <AlertDialog open={!!deleteAssignmentConfirmation} onOpenChange={() => setDeleteAssignmentConfirmation(null)}>
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
                if (deleteAssignmentConfirmation) {
                  deleteAssignment(deleteAssignmentConfirmation);
                  setDeleteAssignmentConfirmation(null);
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
