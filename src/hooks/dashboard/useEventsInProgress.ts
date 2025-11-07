import { useMemo } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { getEventsInProgress } from '@/utils/dashboardData';

export const useEventsInProgress = () => {
  const { events } = useEnhancedData();
  const now = new Date();
  const inProgress = useMemo(() => getEventsInProgress(events, now), [events]);
  return inProgress;
};