
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, X, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { PayrollDetails } from './types';

interface PayrollCardProps {
  details: PayrollDetails;
  onRegisterPayment: (personnelId: string, totalAmount: number) => void;
  onCancelPayment: (paymentId: string, personName: string) => void;
  personnelId: string;
}

export const PayrollCard: React.FC<PayrollCardProps> = ({
  details,
  onRegisterPayment,
  onCancelPayment,
  personnelId
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-lg">{details.personName}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {details.personType === 'fixo' ? 'Funcionário Fixo' : 'Freelancer'}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(details.totalPay)}
            </div>
            {details.paid ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Pagamento Registrado
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Cancelar Pagamento
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja cancelar o pagamento de <strong>{details.personName}</strong>? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          if (details.paymentHistory.length > 0) {
                            onCancelPayment(details.paymentHistory[details.paymentHistory.length - 1].id, details.personName);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Confirmar Cancelamento
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <Button 
                size="sm" 
                onClick={() => onRegisterPayment(personnelId, details.totalPay)}
              >
                Registrar Pagamento
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Dias Trabalhados</div>
            <div className="font-medium">{details.workDays} dias</div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Horas Extras</div>
            <div className="font-medium">{details.totalOvertimeHours}h</div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Cachê Total</div>
            <div className="font-medium">{formatCurrency(details.cachePay)}</div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Valor Horas Extras</div>
            <div className="font-medium">{formatCurrency(details.overtimePay)}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Detalhamento:</span>
            <div className="text-right">
              {details.baseSalary > 0 && (
                <div>Salário Base: {formatCurrency(details.baseSalary)}</div>
              )}
              <div>Cachê ({details.workDays} × {formatCurrency(details.cacheRate)}): {formatCurrency(details.cachePay)}</div>
              <div>Horas Extras ({details.totalOvertimeHours}h × {formatCurrency(details.overtimeRate)}): {formatCurrency(details.overtimePay)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
