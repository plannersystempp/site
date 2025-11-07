import { useMemo } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { getUpcomingPayments } from '@/utils/dashboardData';

export const useUpcomingPayments = (completedEventIds: string[]) => {
  const { events } = useEnhancedData();
  const start = new Date();
  const upcoming = useMemo(
    () => getUpcomingPayments(events, completedEventIds, start),
    [events, completedEventIds]
  );
  return upcoming;
};