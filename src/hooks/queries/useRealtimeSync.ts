/**
 * Hook central que ativa todos os sistemas de sincronização em tempo real
 * Deve ser chamado uma vez no componente raiz da aplicação
 */
import { usePersonnelRealtime } from './usePersonnelRealtime';
import { useEventsRealtime } from './useEventsRealtime';
import { useAllocationsRealtime } from './useAllocationsRealtime';
import { useDivisionsRealtime } from './useDivisionsRealtime';
import { useWorkLogsRealtime } from './useWorkLogsRealtime';
import { useFunctionsRealtime } from './useFunctionsRealtime';

export const useRealtimeSync = () => {
  // Ativar todos os sistemas de Realtime
  usePersonnelRealtime();
  useEventsRealtime();
  useAllocationsRealtime();
  useDivisionsRealtime();
  useWorkLogsRealtime();
  useFunctionsRealtime();
  
  console.log('[RealtimeSync] All realtime subscriptions active');
};
