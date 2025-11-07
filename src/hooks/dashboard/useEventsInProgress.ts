import { useMemo } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { getEventsInProgress } from '@/utils/dashboardData';

export const useEventsInProgress = () => {
  const { events } = useEnhancedData();
  const now = new Date();
  
  // Converter eventos para o formato esperado
  const eventsFormatted = useMemo(() => 
    events.map(e => ({ ...e, name: e.name || '', status: e.status || 'planejado' })),
    [events]
  );
  
  const inProgress = useMemo(() => getEventsInProgress(eventsFormatted, now), [eventsFormatted]);
  return inProgress;
};