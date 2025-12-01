import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/logger';

/**
 * FASE 4: Sincronização Cross-Tab com BroadcastChannel
 * 
 * Sincroniza invalidações de cache entre múltiplas abas/janelas
 * do mesmo navegador. Quando um usuário faz uma atualização em uma aba,
 * todas as outras abas são notificadas e invalidam seus caches automaticamente.
 */

interface SyncMessage {
  type: 'INVALIDATE_QUERIES';
  queryKey: any[];
  timestamp: number;
}

export const useCrossTabSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Verificar se BroadcastChannel é suportado
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('[CrossTabSync] BroadcastChannel not supported, using localStorage fallback');
      
      // Fallback para iOS < 15.4 usando localStorage
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'plannersystem-sync' && e.newValue) {
          try {
            const message: SyncMessage = JSON.parse(e.newValue);
            if (message.type === 'INVALIDATE_QUERIES') {
              logger.realtime.info('🔄 [CrossTabSync] Received invalidation via localStorage', { 
                queryKey: message.queryKey, 
                timestamp: message.timestamp 
              });
              
              queryClient.invalidateQueries({ 
                queryKey: message.queryKey,
                refetchType: 'active'
              });
            }
          } catch (error) {
            console.error('[CrossTabSync] Error parsing localStorage message:', error);
          }
        }
      };
      
      window.addEventListener('storage', handleStorage);
      logger.realtime.info('✅ [CrossTabSync] localStorage fallback enabled');
      
      return () => {
        window.removeEventListener('storage', handleStorage);
        logger.realtime.info('🔌 [CrossTabSync] localStorage fallback closed');
      };
    }

    const channel = new BroadcastChannel('plannersystem-sync');

    // Escutar mensagens de outras abas
    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const { type, queryKey, timestamp } = event.data;

      if (type === 'INVALIDATE_QUERIES') {
        logger.realtime.info('🔄 [CrossTabSync] Received invalidation from another tab', { queryKey, timestamp });
        
        // Invalidar queries no cache local
        queryClient.invalidateQueries({ 
          queryKey,
          refetchType: 'active' // Apenas queries ativas
        });
      }
    };

    logger.realtime.info('✅ [CrossTabSync] Channel opened');

    // Cleanup
    return () => {
      logger.realtime.info('🔌 [CrossTabSync] Channel closed');
      channel.close();
    };
  }, [queryClient]);

  // Retornar função para outras abas invalidarem
  const broadcastInvalidation = (queryKey: any[]) => {
    if (typeof BroadcastChannel === 'undefined') return;

    try {
      const channel = new BroadcastChannel('plannersystem-sync');
      const message: SyncMessage = {
        type: 'INVALIDATE_QUERIES',
        queryKey,
        timestamp: Date.now(),
      };
      
      channel.postMessage(message);
      channel.close();
      
      logger.realtime.info('📡 [CrossTabSync] Broadcasted invalidation', { queryKey });
    } catch (error) {
      console.error('[CrossTabSync] Error broadcasting:', error);
    }
  };

  return { broadcastInvalidation };
};
