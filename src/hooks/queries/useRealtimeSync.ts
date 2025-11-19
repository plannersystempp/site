/**
 * Hook central que ativa todos os sistemas de sincronização em tempo real
 * Deve ser chamado uma vez no componente raiz da aplicação
 * 
 * FASE 4: Agora inclui sincronização cross-tab
 */
import { usePersonnelRealtime } from './usePersonnelRealtime';
import { useEventsRealtime } from './useEventsRealtime';
import { useAllocationsRealtime } from './useAllocationsRealtime';
import { useDivisionsRealtime } from './useDivisionsRealtime';
import { useWorkLogsRealtime } from './useWorkLogsRealtime';
import { useFunctionsRealtime } from './useFunctionsRealtime';
import { usePersonnelPaymentsRealtime } from './usePersonnelPaymentsRealtime';
import { useCrossTabSync } from './useCrossTabSync';

export const useRealtimeSync = () => {
  // Ativar todos os sistemas de Realtime
  usePersonnelRealtime();
  useEventsRealtime();
  useAllocationsRealtime();
  useDivisionsRealtime();
  useWorkLogsRealtime();
  useFunctionsRealtime();
  usePersonnelPaymentsRealtime();
  
  // FASE 4: Ativar sincronização cross-tab
  useCrossTabSync();
  
  console.log('[RealtimeSync] All realtime subscriptions active + cross-tab sync enabled');
};
