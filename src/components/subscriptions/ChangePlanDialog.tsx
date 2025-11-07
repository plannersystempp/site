import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSubscriptionId: string;
  currentPlanId: string;
  teamName: string;
  onSuccess?: () => void;
  returnFocusTo?: React.RefObject<HTMLElement>;
}

interface Plan {
  id: string;
  display_name: string;
  price: number;
  description: string;
}

export function ChangePlanDialog({
  open,
  onOpenChange,
  currentSubscriptionId,
  currentPlanId,
  teamName,
  onSuccess,
  returnFocusTo
}: ChangePlanDialogProps) {
  const queryClient = useQueryClient();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, display_name, price, description')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos disponíveis.',
        variant: 'destructive'
      });
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) {
      toast({
        title: 'Atenção',
        description: 'Por favor, selecione um plano.',
        variant: 'default'
      });
      return;
    }

    if (selectedPlanId === currentPlanId) {
      toast({
        title: 'Aviso',
        description: 'Você selecionou o plano atual. Escolha um plano diferente.',
        variant: 'default'
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('change-subscription-plan', {
        body: {
          subscriptionId: currentSubscriptionId,
          newPlanId: selectedPlanId
        }
      });

      if (error) throw error;

      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      
      toast({
        title: 'Sucesso!',
        description: `Plano da equipe "${teamName}" alterado para "${selectedPlan?.display_name}" com sucesso!`,
      });

      // Refetch das queries de assinaturas para refletir a mudança imediatamente
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao mudar plano:', error);
      toast({
        title: 'Erro ao alterar plano',
        description: error.message || 'Não foi possível alterar o plano. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alterar Plano</DialogTitle>
          <DialogDescription>
            Selecione um novo plano para a equipe <strong>{teamName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loadingPlans ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlanId === plan.id
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    } ${plan.id === currentPlanId ? 'opacity-60' : ''}`}
                  >
                    <RadioGroupItem 
                      value={plan.id} 
                      id={plan.id}
                      className="pointer-events-none"
                    />
                    <Label
                      htmlFor={plan.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold">
                            {plan.display_name}
                            {plan.id === currentPlanId && (
                              <span className="ml-2 text-xs text-muted-foreground">(Plano Atual)</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {plan.description}
                          </p>
                        </div>
                        <p className="text-lg font-bold whitespace-nowrap">
                          {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleChangePlan}
            disabled={loading || !selectedPlanId || selectedPlanId === currentPlanId}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Alterando...
              </>
            ) : (
              'Confirmar Mudança'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
