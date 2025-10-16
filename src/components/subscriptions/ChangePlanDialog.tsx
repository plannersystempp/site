import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSubscriptionActions } from '@/hooks/useSubscriptionActions';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
}

interface Plan {
  id: string;
  display_name: string;
  price: number;
  description: string;
}

export function ChangePlanDialog({ open, onOpenChange, subscriptionId }: ChangePlanDialogProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { changePlan } = useSubscriptionActions();

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('id, display_name, price, description')
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data) {
      setPlans(data);
      if (data.length > 0) {
        setSelectedPlanId(data[0].id);
      }
    }
    setLoading(false);
  };

  const handleChangePlan = async () => {
    await changePlan.mutateAsync({ subscriptionId, newPlanId: selectedPlanId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alterar Plano de Assinatura</DialogTitle>
          <DialogDescription>
            Selecione o novo plano para esta equipe.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <RadioGroupItem value={plan.id} id={plan.id} />
                  <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                    <div className="font-semibold">{plan.display_name}</div>
                    <div className="text-sm text-muted-foreground">{plan.description}</div>
                  </Label>
                  <div className="text-lg font-bold">
                    R$ {plan.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePlan} 
            disabled={changePlan.isPending || loading || !selectedPlanId}
          >
            {changePlan.isPending ? 'Alterando...' : 'Confirmar Alteração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
