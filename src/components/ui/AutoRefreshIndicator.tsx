import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoRefreshIndicatorProps {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  error: Error | null;
  refreshCount: number;
  onManualRefresh?: () => void;
  className?: string;
}

/**
 * Indicador visual para atualizações automáticas
 * Mostra estado de carregamento, última atualização e erros
 */
export const AutoRefreshIndicator: React.FC<AutoRefreshIndicatorProps> = ({
  isRefreshing,
  lastRefresh,
  error,
  refreshCount,
  onManualRefresh,
  className
}) => {
  const formatLastRefresh = (date: Date | null): string => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 5) return 'Agora';
    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffMinutes < 60) return `${diffMinutes}min`;
    
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm border shadow-sm",
      "transition-all duration-300",
      error && "border-red-200 bg-red-50",
      className
    )}>
      {/* Ícone de atualização */}
      <div className="relative">
        <RefreshCw 
          className={cn(
            "w-4 h-4 text-gray-600",
            isRefreshing && "animate-spin text-blue-600"
          )}
        />
        {isRefreshing && (
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />
        )}
      </div>

      {/* Texto de status */}
      <div className="flex-1 min-w-0">
        {error ? (
          <div className="flex items-center gap-1 text-red-600">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs font-medium">Erro na atualização</span>
          </div>
        ) : (
          <div className="text-xs text-gray-600">
            <span className="font-medium">
              {isRefreshing ? 'Atualizando...' : 'Atualizado'}
            </span>
            {lastRefresh && (
              <span className="ml-1 text-gray-500">
                há {formatLastRefresh(lastRefresh)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Contador de atualizações */}
      {refreshCount > 0 && (
        <div className="text-xs text-gray-400 font-mono">
          {refreshCount}
        </div>
      )}

      {/* Botão de atualização manual */}
      {onManualRefresh && !isRefreshing && (
        <button
          onClick={onManualRefresh}
          className="ml-1 p-1 rounded hover:bg-gray-100 transition-colors"
          title="Atualizar agora"
        >
          <RefreshCw className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
};