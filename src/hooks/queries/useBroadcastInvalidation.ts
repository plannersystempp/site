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
    const message: SyncMessage = {
      type: 'INVALIDATE_QUERIES',
      queryKey: [...queryKey], // Convert readonly to mutable
      timestamp: Date.now(),
    };

    // Verificar se BroadcastChannel é suportado
    if (typeof BroadcastChannel === 'undefined') {
      logger.realtime.warn('[BroadcastInvalidation] BroadcastChannel not supported, using localStorage fallback');
      
      try {
        localStorage.setItem('plannersystem-sync', JSON.stringify(message));
        // Limpar após propagação
        setTimeout(() => localStorage.removeItem('plannersystem-sync'), 100);
        logger.realtime.info('📡 [BroadcastInvalidation] Broadcasted via localStorage', { queryKey });
      } catch (error) {
        console.error('[BroadcastInvalidation] Error broadcasting via localStorage:', error);
      }
      return;
    }

    try {
      const channel = new BroadcastChannel('plannersystem-sync');
      channel.postMessage(message);
      channel.close();
      
      logger.realtime.info('📡 [BroadcastInvalidation] Broadcasted', { queryKey });
    } catch (error) {
      console.error('[BroadcastInvalidation] Error broadcasting:', error);
    }
  };

  return { broadcast };
};
