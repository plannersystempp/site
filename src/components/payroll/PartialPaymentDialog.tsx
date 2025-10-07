import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/ui/currency-input';
import { formatCurrency } from '@/utils/formatters';

interface PartialPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  totalAmount: number;
  paidAmount: number;
  onConfirm: (amount: number, notes: string) => void;
  loading: boolean;
}

export const PartialPaymentDialog: React.FC<PartialPaymentDialogProps> = ({
  open,
  onOpenChange,
  personName,
  totalAmount,
  paidAmount,
  onConfirm,
  loading
}) => {
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  
  const remainingAmount = totalAmount - paidAmount;
  const maxPayment = remainingAmount;
  const isValidAmount = amount > 0 && amount <= maxPayment;

  const handleConfirm = () => {
    if (isValidAmount) {
      onConfirm(amount, notes);
      setAmount(0);
      setNotes('');
    }
  };

  const handleCancel = () => {
    setAmount(0);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="partial-payment-description">
        <DialogHeader>
          <DialogTitle>Pagamento Parcial - {personName}</DialogTitle>
          <div id="partial-payment-description" className="sr-only">
            Formulário para registrar pagamento parcial
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
            {paidAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Já pago:</span>
                <span className="text-green-600">{formatCurrency(paidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Pendente:</span>
              <span className="font-bold text-primary">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          {/* Payment Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Pagamento</Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onChange={setAmount}
              placeholder="R$ 0,00"
              className={!isValidAmount && amount > 0 ? 'border-destructive' : ''}
            />
            {amount > maxPayment && (
              <p className="text-xs text-destructive">
                Valor não pode ser maior que {formatCurrency(maxPayment)}
              </p>
            )}
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Adiantamento solicitado pelo funcionário..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 min-h-[44px]"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValidAmount || loading}
              className="flex-1 min-h-[44px]"
            >
              {loading ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};