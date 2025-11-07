import { useMemo } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { getUpcomingPayments } from '@/utils/dashboardData';

export const useUpcomingPayments = (completedEventIds: string[]) => {
  const { events } = useEnhancedData();
  const start = new Date();
  
  // Converter eventos para o formato esperado
  const eventsFormatted = useMemo(() => 
    events.map(e => ({ ...e, name: e.name || '', status: e.status || 'planejado' })),
    [events]
  );
  
  const upcoming = useMemo(
    () => getUpcomingPayments(eventsFormatted, completedEventIds, start),
    [eventsFormatted, completedEventIds]
  );
  return upcoming;
};