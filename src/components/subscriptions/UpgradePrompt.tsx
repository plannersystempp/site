import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  currentPlan?: string;
  limit?: number;
  currentCount?: number;
}

export function UpgradePrompt({ 
  open, 
  onOpenChange, 
  reason, 
  currentPlan, 
  limit,
  currentCount 
}: UpgradePromptProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/app/upgrade');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <AlertDialogTitle>Limite do Plano Atingido</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p className="font-medium text-foreground">{reason}</p>
            
            {currentPlan && (
              <div className="text-sm">
                <p>Plano atual: <span className="font-semibold">{currentPlan}</span></p>
                {limit && currentCount !== undefined && (
                  <p>Uso: <span className="font-semibold">{currentCount}/{limit}</span></p>
                )}
              </div>
            )}
            
            <p className="text-sm">
              Faça upgrade para um plano superior e continue usando o PlannerSystem sem limitações.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade}>
            Ver Planos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
