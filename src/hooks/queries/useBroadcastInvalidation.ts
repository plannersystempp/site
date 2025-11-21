/**
 * FASE 3: Hook para broadcast de invalidações cross-tab
 * 
 * Permite que mutations notifiquem outras abas/janelas para invalidarem seus caches.
 * Funciona em conjunto com useCrossTabSync para sincronização cross-tab.
 */

import { logger } from '@/utils/logger';

interface SyncMessage {
  type: 'INVALIDATE_QUERIES';
  queryKey: any[];
  timestamp: number;
}

export const useBroadcastInvalidation = () => {
  const broadcast = (queryKey: readonly any[]) => {
    // Verificar se BroadcastChannel é suportado
    if (typeof BroadcastChannel === 'undefined') {
      logger.realtime.warn('[BroadcastInvalidation] BroadcastChannel not supported');
      return;
    }

    try {
      const channel = new BroadcastChannel('plannersystem-sync');
      const message: SyncMessage = {
        type: 'INVALIDATE_QUERIES',
        queryKey: [...queryKey], // Convert readonly to mutable
        timestamp: Date.now(),
      };
      
      channel.postMessage(message);
      channel.close();
      
      logger.realtime.info('📡 [BroadcastInvalidation] Broadcasted', { queryKey });
    } catch (error) {
      console.error('[BroadcastInvalidation] Error broadcasting:', error);
    }
  };

  return { broadcast };
};
