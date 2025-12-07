import { useMemo } from 'react';
import { filterSupplierCostsByDateRange } from '@/utils/dashboardFilters';
import { calcEventSupplierTotals, filterSupplierCostsByStatus, groupSupplierCostsByEvent, sortSupplierCostsByLatest, EventLite, SupplierCost, GroupedEventCosts } from '@/utils/supplierCostAggregations';

export const useSupplierCostsByEvent = (
  costs: SupplierCost[],
  events: EventLite[],
  range: 'hoje' | '7dias' | '30dias' | 'todos',
  status: 'todos' | 'pendente' | 'pago'
) => {
  return useMemo<GroupedEventCosts[]>(() => {
    const now = new Date();
    const byRange = filterSupplierCostsByDateRange(costs, range, now) as SupplierCost[];
    const byStatus = filterSupplierCostsByStatus(byRange, status);
    const grouped = groupSupplierCostsByEvent(byStatus, events).map(g => ({
      ...g,
      items: sortSupplierCostsByLatest(g.items),
    }));
    return grouped.sort((a, b) => b.totals.pendingAmount - a.totals.pendingAmount);
  }, [costs, events, range, status]);
};

export const useSupplierTotalsForPeriod = (
  costs: SupplierCost[],
  range: 'hoje' | '7dias' | '30dias' | 'todos'
) => {
  return useMemo(() => {
    const now = new Date();
    const filtered = filterSupplierCostsByDateRange(costs, range, now) as SupplierCost[];
    const totals = calcEventSupplierTotals(filtered);
    return totals;
  }, [costs, range]);
};
