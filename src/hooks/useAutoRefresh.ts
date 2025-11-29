import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';

interface UseAutoRefreshOptions {
  enabled?: boolean;
  interval?: number;
  queryKeys?: string[][];
  onRefresh?: () => void;
  onError?: (error: Error) => void;
}

interface AutoRefreshState {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  error: Error | null;
  refreshCount: number;
}

/**
 * Hook para atualização automática de dados com polling
 * Mantém UI responsiva com indicadores visuais de atualização
 */
export const useAutoRefresh = (options: UseAutoRefreshOptions = {}) => {
  const {
    enabled = true,
    interval = 5000, // 5 segundos padrão
    queryKeys = [],
    onRefresh,
    onError
  } = options;

  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<AutoRefreshState>({
    isRefreshing: false,
    lastRefresh: null,
    error: null,
    refreshCount: 0
  });

  const refreshData = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isRefreshing: true, error: null }));

    try {
      const startTime = Date.now();
      
      // Invalidar queries específicas
      if (queryKeys.length > 0) {
        await Promise.all(
          queryKeys.map(keys => 
            queryClient.invalidateQueries({ queryKey: keys })
          )
        );
      } else {
        // Invalidar todas as queries ativas se nenhuma específica for fornecida
        await queryClient.invalidateQueries({ refetchType: 'active' });
      }

      const duration = Date.now() - startTime;
      
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        lastRefresh: new Date(),
        refreshCount: prev.refreshCount + 1,
        error: null
      }));

      // Callback de sucesso
      onRefresh?.();
      
      console.log(`[AutoRefresh] ✅ Dados atualizados com sucesso em ${duration}ms`);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Erro desconhecido');
      
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error: errorObj
      }));

      // Callback de erro
      onError?.(errorObj);
      
      console.error('[AutoRefresh] Erro ao atualizar dados:', error);
    }
  }, [enabled, queryKeys, queryClient, onRefresh, onError]);

  // Sistema de debounce para múltiplas atualizações
  const debouncedRefresh = useDebounce(refreshData, 1000, {
    leading: false,
    trailing: true
  });

  useEffect(() => {
    if (!enabled) {
      // Limpar intervalo se desabilitado
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Configurar polling com debounce
    intervalRef.current = setInterval(debouncedRefresh, interval);

    // Executar primeira atualização imediatamente
    debouncedRefresh();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, debouncedRefresh]);

  // Métodos de controle
  const start = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(debouncedRefresh, interval);
    debouncedRefresh();
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const manualRefresh = () => {
    debouncedRefresh();
  };

  return {
    ...state,
    refresh: manualRefresh,
    start,
    stop
  };
};