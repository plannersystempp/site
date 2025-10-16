import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSubscriptionActions } from '@/hooks/useSubscriptionActions';

interface ExtendTrialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
}

export function ExtendTrialDialog({ open, onOpenChange, subscriptionId }: ExtendTrialDialogProps) {
  const [days, setDays] = useState<number>(7);
  const { extendTrial } = useSubscriptionActions();

  const handleExtend = async () => {
    await extendTrial.mutateAsync({ subscriptionId, days });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estender Período de Trial</DialogTitle>
          <DialogDescription>
            Selecione quantos dias deseja adicionar ao período de teste.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="7" id="7days" />
            <Label htmlFor="7days">7 dias</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="15" id="15days" />
            <Label htmlFor="15days">15 dias</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="30" id="30days" />
            <Label htmlFor="30days">30 dias</Label>
          </div>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExtend} disabled={extendTrial.isPending}>
            {extendTrial.isPending ? 'Estendendo...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
