import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User, DollarSign, MoreVertical, CheckCircle, XCircle, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MarkAsPaidDialog } from './MarkAsPaidDialog';
import { PersonnelPaymentFormDialog } from './PersonnelPaymentFormDialog';
import { useQueryClient } from '@tanstack/react-query';
import { personnelPaymentsService } from '@/services/personnelPaymentsService';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { parseDateSafe } from '@/utils/dateUtils';
import type { PersonnelPayment } from '@/contexts/data/types';

interface PersonnelPaymentCardProps {
  payment: PersonnelPayment & { personnel?: any };
}

export const PersonnelPaymentCard = ({ payment }: PersonnelPaymentCardProps) => {
  const [showMarkAsPaid, setShowMarkAsPaid] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const queryClient = useQueryClient();

  const dueDate = parseDateSafe(payment.payment_due_date);
  const isOverdue = payment.payment_status === 'pending' && dueDate < new Date();

  const statusConfig = {
    pending: { label: 'Pendente', class: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
    paid: { label: 'Pago', class: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    cancelled: { label: 'Cancelado', class: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' },
  };

  const handleDelete = async () => {
    try {
      await personnelPaymentsService.delete(payment.id);
      queryClient.invalidateQueries({ queryKey: ['personnel-payments'] });
      toast({
        title: 'Pagamento excluído',
        description: 'O pagamento foi removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o pagamento.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async () => {
    try {
      await personnelPaymentsService.cancel(payment.id);
      queryClient.invalidateQueries({ queryKey: ['personnel-payments'] });
      toast({
        title: 'Pagamento cancelado',
        description: 'O pagamento foi marcado como cancelado.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Não foi possível cancelar o pagamento.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className={isOverdue ? 'border-destructive' : ''}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{payment.personnel?.name || 'N/A'}</span>
              </div>
              <Badge className={statusConfig[payment.payment_status].class}>
                {statusConfig[payment.payment_status].label}
              </Badge>
            </div>
            {payment.payment_status === 'pending' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowMarkAsPaid(true)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar como Pago
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowEdit(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCancel}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDelete(true)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm">{payment.description}</p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Vencimento: {format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>

          {payment.notes && (
            <p className="text-xs text-muted-foreground italic">{payment.notes}</p>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center gap-2 w-full">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">
              {Number(payment.amount).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>
        </CardFooter>
      </Card>

      {showMarkAsPaid && (
        <MarkAsPaidDialog
          open={showMarkAsPaid}
          onOpenChange={setShowMarkAsPaid}
          payment={payment}
        />
      )}

      {showEdit && (
        <PersonnelPaymentFormDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          payment={payment}
        />
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
