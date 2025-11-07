import { useMemo } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { computeDashboardKpis } from '@/utils/dashboardData';

export const useDashboardKpis = (superAdminPersonnelCount: number | null) => {
  const { functions, personnel, events } = useEnhancedData();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const functionsCount = useMemo(() => {
    if (isSuperAdmin) {
      const unique = new Set(functions.map((f) => f.name.trim().toLowerCase()));
      return unique.size;
    }
    return functions.length;
  }, [functions, isSuperAdmin]);

  const personnelCount = isSuperAdmin && superAdminPersonnelCount !== null
    ? superAdminPersonnelCount
    : personnel.length;

  return useMemo(() => computeDashboardKpis({
    events,
    functionsCount,
    personnelCount,
  }), [events, functionsCount, personnelCount]);
};