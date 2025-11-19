import { useEffect, useState } from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

/**
 * FASE 5: Loading States e Feedback Visual
 * 
 * Componente que mostra indicadores visuais de:
 * - Sincronização em tempo real
 * - Atualização de dados em progresso
 * - Status da conexão realtime
 */

interface RealtimeIndicatorProps {
  isConnected: boolean;
  isUpdating: boolean;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  isConnected,
  isUpdating,
}) => {
  const [showIndicator, setShowIndicator] = useState(false);

  // Mostrar indicador apenas quando estiver atualizando
  useEffect(() => {
    if (isUpdating) {
      setShowIndicator(true);
      const timer = setTimeout(() => setShowIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUpdating]);

  // Toast de conexão perdida
  useEffect(() => {
    if (!isConnected) {
      toast.warning('Conexão em tempo real perdida', {
        description: 'Tentando reconectar...',
        duration: 5000,
      });
    }
  }, [isConnected]);

  if (!showIndicator && isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-background/95 px-4 py-2 shadow-lg border border-border backdrop-blur-sm">
      {isUpdating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Atualizando dados...
          </span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            Sincronizado
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-sm text-muted-foreground">
            Desconectado
          </span>
        </>
      )}
    </div>
  );
};

/**
 * Hook para controlar o estado do indicador
 */
export const useRealtimeIndicator = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const showUpdating = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 1500);
  };

  return {
    isUpdating,
    isConnected,
    setIsConnected,
    showUpdating,
  };
};
