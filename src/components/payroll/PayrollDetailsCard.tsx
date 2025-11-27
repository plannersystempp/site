import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, DollarSign, Copy, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { PayrollDetails } from './types';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AbsencesModal } from '../personnel/AbsencesModal';
import { PartialPaymentDialog } from './PartialPaymentDialog';
import { formatCurrency } from '@/utils/formatters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { Checkbox } from '@/components/ui/checkbox';

interface PayrollDetailsCardProps {
  detail: PayrollDetails;
  onRegisterPayment: (personnelId: string, totalAmount: number, notes?: string) => void;
  onRegisterPartialPayment: (personnelId: string, amount: number, notes: string) => void;
  onCancelPayment: (paymentId: string, personnelName: string) => void;
  loading: boolean;
  pixKey?: string;
  hasEventSpecificCache?: boolean;
  eventSpecificCacheRate?: number;
}

export const PayrollDetailsCard: React.FC<PayrollDetailsCardProps> = ({
  detail,
  onRegisterPayment,
  onRegisterPartialPayment,
  onCancelPayment,
  loading,
  pixKey,
  hasEventSpecificCache,
  eventSpecificCacheRate
}) => {
  const { userRole } = useTeam();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const [showAbsencesModal, setShowAbsencesModal] = useState(false);
  const [showPartialPaymentDialog, setShowPartialPaymentDialog] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [confirmPermanent, setConfirmPermanent] = useState(false);

  const copyPixKey = async () => {
    if (pixKey) {
      try {
        await navigator.clipboard.writeText(pixKey);
        toast({
          title: "Copiado!",
          description: "Chave PIX copiada para a área de transferência",
        });
      } catch (error) {
        console.error('Error copying PIX key:', error);
        toast({
          title: "Erro",
          description: "Não foi possível copiar a chave PIX",
          variant: "destructive"
        });
      }
    }
  };
  return (
    <Card className="border-l-2 border-l-primary">
      <CardContent className="p-2 sm:p-2">
        <div className={`${isMobile ? 'space-y-1.5' : 'flex items-center justify-between'} mb-1.5`}>
          <div className={isMobile ? 'space-y-1.5' : ''}>
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <h3 className="font-semibold text-sm sm:text-base">{detail.personName}</h3>
              {detail.absencesCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="cursor-pointer hover:bg-destructive/90 text-xs"
                  onClick={() => setShowAbsencesModal(true)}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {detail.absencesCount} falta{detail.absencesCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">{detail.personType}</Badge>
          </div>
          <div className={`${isMobile ? 'text-left' : 'text-right'}`}>
            {detail.paidAmount > 0 ? (
              <div>
                <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-green-600`}>
                  {formatCurrency(detail.totalPay)}
                </p>
                <div className={`${isMobile ? 'flex-col space-y-1' : 'flex items-center gap-1'} text-xs sm:text-sm`}>
                  <span className="text-green-600">Pago: {formatCurrency(detail.paidAmount)}</span>
                  {detail.pendingAmount > 0 && (
                    <span className="text-orange-600">Pendente: {formatCurrency(detail.pendingAmount)}</span>
                  )}
                </div>
                <Badge variant={detail.paid ? "default" : "secondary"} className="mt-0.5 text-xs">
                  {detail.paid ? "Pago Integral" : "Pagamento Parcial"}
                </Badge>
              </div>
            ) : (
              <div>
                <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-green-600`}>
                  {formatCurrency(detail.totalPay)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total a Pagar</p>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-1.5" />
        
        {/* Detalhamento dos Cálculos */}
        <div className={`${
          isMobile 
            ? 'grid grid-cols-2 gap-1.5'
            : 'flex items-center gap-2'
        } mb-1.5`}>
          {detail.personType === 'fixo' && (
            <div className={`${isMobile ? 'p-1.5 rounded-lg' : 'text-center lg:text-left lg:flex-1 lg:min-w-[200px]'}`}>
              <p className="text-xs sm:text-sm text-muted-foreground">Salário Base</p>
              <p className="font-semibold text-sm">R$ {detail.baseSalary.toFixed(2)}</p>
            </div>
          )}
          <div className={`${isMobile ? 'p-1.5 rounded-lg' : 'text-center lg:text-left lg:flex-1 lg:min-w-[200px]'}`}>
            <div className={`${isMobile ? 'flex items-start justify-between' : 'flex items-center justify-start gap-1'} mb-0.5`}>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cachês ({detail.workDays} dias)
              </p>
              {hasEventSpecificCache && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        ⭐ Específico
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div className="font-medium">Cache específico do evento</div>
                        <div>Taxa aplicada: {formatCurrency(eventSpecificCacheRate || 0)}/dia</div>
                        <div>Cálculo: {formatCurrency(eventSpecificCacheRate || 0)} × {detail.workDays} dias</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="font-semibold text-sm">R$ {detail.cachePay.toFixed(2)}</p>
            {hasEventSpecificCache && eventSpecificCacheRate && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {formatCurrency(eventSpecificCacheRate)} × {detail.workDays} dias
              </p>
            )}
          </div>
          <div className={`${isMobile ? 'p-1.5 rounded-lg' : 'text-center lg:text-left lg:flex-1 lg:min-w-[200px]'}`}>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Horas Extras: {detail.totalOvertimeHours}h
            </p>
            <p className="font-semibold text-sm">{formatCurrency(detail.overtimePay)}</p>
            {detail.overtimeConversionApplied ? (
              <p className="text-[11px] text-muted-foreground mt-1">
                {detail.overtimeCachesUsed} cachê{detail.overtimeCachesUsed > 1 ? 's' : ''} diário{detail.overtimeCachesUsed > 1 ? 's' : ''}
                {detail.overtimeRemainingHours && detail.overtimeRemainingHours > 0 && 
                  ` + ${detail.overtimeRemainingHours.toFixed(1)}h avulsas`
                }
              </p>
            ) : (
              detail.totalOvertimeHours > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {detail.totalOvertimeHours}h × {formatCurrency(detail.overtimeRate)}
                </p>
              )
            )}
          </div>
          {/* PIX Key Section - Only visible to admins */}
          {isAdmin && pixKey && (
            <div className={`${isMobile ? 'p-1.5 rounded-lg col-span-2' : 'text-center lg:text-left lg:flex-1 lg:min-w-[220px]'}`}>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1.5">Chave PIX</p>
              <div className={`${isMobile ? 'flex items-center justify-between' : 'flex items-center justify-start gap-2'}`}>
                <p className={`text-xs font-mono ${isMobile ? 'truncate flex-1 mr-2' : 'truncate max-w-24'}`}>{pixKey}</p>
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={copyPixKey}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Payment History */}
        {detail.paymentHistory.length > 0 && (
          <>
            <Separator className="my-2" />
            <div>
              <h4 className="font-medium mb-1.5 text-sm">Histórico de Pagamentos</h4>
              <div className="space-y-1.5">
                {detail.paymentHistory.map((payment) => (
                  <div key={payment.id} className={`${
                    isMobile 
                      ? 'flex flex-col space-y-1.5 p-1.5' 
                      : 'flex items-center justify-between p-1.5'
                  } bg-muted rounded-lg`}>
                    <div className={`${isMobile ? 'flex items-center gap-1.5 flex-1' : 'flex items-center gap-1.5'}`}>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{formatCurrency(payment.amount)}</span>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(payment.paidAt).toLocaleString('pt-BR')}
                        </p>
                        {payment.notes && (
                          <p className="text-[11px] text-muted-foreground italic break-words">"{payment.notes}"</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmCancelId(payment.id)}
                      disabled={loading}
                      className={`${
                        isMobile 
                          ? 'h-6 w-full justify-center' 
                          : 'h-6 w-6 p-0'
                      } text-destructive hover:text-destructive flex-shrink-0`}
                    >
                      <Trash2 className="w-3 h-3" />
                      {isMobile && <span className="ml-2 text-xs">Cancelar</span>}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className={`${isMobile ? 'flex flex-col gap-1.5' : 'flex justify-end gap-1.5'} pt-2`}>
          {detail.paid ? (
            <div className={`${isMobile ? 'text-center' : 'flex flex-col items-end gap-2'}`}>
              <div className="flex items-center gap-1.5 text-green-600 justify-center">
                <Check className="w-3 h-3" />
                <span className="font-medium text-xs sm:text-sm">Pagamento Integral Concluído</span>
              </div>
            </div>
          ) : detail.paidAmount > 0 ? (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowPartialPaymentDialog(true)}
                disabled={loading}
                className={`${isMobile ? 'w-full' : ''} h-6 px-2`}
              >
                <Clock className="w-3 h-3 mr-2" />
                Pagamento Parcial
              </Button>
              <Button 
                size="sm"
                onClick={() => onRegisterPayment(detail.personnelId, detail.pendingAmount)}
                disabled={loading}
                className={`${isMobile ? 'w-full' : ''} h-6 px-2`}
              >
                <DollarSign className="w-3 h-3 mr-2" />
                {isMobile ? `Pagar Restante` : `Pagar Restante (${formatCurrency(detail.pendingAmount)})`}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowPartialPaymentDialog(true)}
                disabled={loading}
                className={`${isMobile ? 'w-full' : ''} h-6 px-2`}
              >
                <Clock className="w-3 h-3 mr-2" />
                Pagamento Parcial
              </Button>
              <Button 
                size="sm"
                onClick={() => onRegisterPayment(detail.personnelId, detail.totalPay)}
                disabled={loading}
                className={`${isMobile ? 'w-full' : ''} h-6 px-2`}
              >
                <DollarSign className="w-3 h-3 mr-2" />
                {isMobile ? 'Registrar Pagamento' : 'Registrar Pagamento Integral'}
              </Button>
            </>
          )}
        </div>

        {/* Modals */}
        <AbsencesModal
          open={showAbsencesModal}
          onOpenChange={setShowAbsencesModal}
          personnelName={detail.personName}
          absences={detail.absences}
          eventName="Evento" // You may want to pass the actual event name
        />
        
        <PartialPaymentDialog
          open={showPartialPaymentDialog}
          onOpenChange={setShowPartialPaymentDialog}
          personName={detail.personName}
          totalAmount={detail.totalPay}
          paidAmount={detail.paidAmount}
          onConfirm={(amount, notes) => {
            onRegisterPartialPayment(detail.personnelId, amount, notes);
            setShowPartialPaymentDialog(false);
          }}
          loading={loading}
        />

        {/* Confirmação de cancelamento de pagamento */}
        <AlertDialog
          open={!!confirmCancelId}
          onOpenChange={(open) => {
            if (!open) {
              setConfirmCancelId(null);
              setConfirmPermanent(false);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar registro de pagamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja cancelar este registro de pagamento? Esta ação é permanente e removerá o registro desta folha.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {(() => {
              const pay = detail.paymentHistory.find(p => p.id === confirmCancelId);
              if (!pay) return null;
              return (
                <div className="mt-3 space-y-1 text-sm">
                  <div><strong>Profissional:</strong> {detail.personName}</div>
                  <div><strong>Valor:</strong> {formatCurrency(pay.amount)}</div>
                  <div><strong>Pago em:</strong> {new Date(pay.paidAt).toLocaleString('pt-BR')}</div>
                  {pay.notes && (
                    <div><strong>Observações:</strong> {pay.notes}</div>
                  )}
                </div>
              );
            })()}
            <div className="mt-4 flex items-center gap-2">
              <Checkbox
                id={`confirm-permanent-cancel-${detail.id}`}
                checked={confirmPermanent}
                onCheckedChange={(v) => setConfirmPermanent(!!v)}
              />
              <label htmlFor={`confirm-permanent-cancel-${detail.id}`} className="text-sm leading-none select-none">
                Entendo que esta ação é permanente
              </label>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!confirmPermanent || !confirmCancelId) return;
                  onCancelPayment(confirmCancelId, detail.personName);
                  setConfirmCancelId(null);
                  setConfirmPermanent(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={!confirmPermanent}
              >
                Cancelar definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};