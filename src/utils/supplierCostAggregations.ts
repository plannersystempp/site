export type SupplierCost = {
  id: string;
  event_id: string;
  supplier_name: string;
  description: string;
  quantity?: number | null;
  unit_price?: number | null;
  total_amount?: number | null;
  paid_amount?: number | null;
  payment_status?: 'pending' | 'paid' | string | null;
  payment_date?: string | Date | null;
  created_at?: string | Date | null;
};

export type EventLite = {
  id: string;
  name: string;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
};

export type GroupedEventCosts = {
  eventId: string;
  name: string;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  totals: {
    paidAmount: number;
    pendingAmount: number;
    paidCount: number;
    pendingCount: number;
  };
  items: SupplierCost[];
};

export const filterSupplierCostsByStatus = <T extends SupplierCost>(items: T[], status: 'todos' | 'pendente' | 'pago'): T[] => {
  if (status === 'todos') return items;
  if (status === 'pago') return items.filter(i => (i.payment_status || '').toLowerCase() === 'paid');
  if (status === 'pendente') return items.filter(i => (i.payment_status || '').toLowerCase() === 'pending');
  return items;
};

export const calcEventSupplierTotals = (items: SupplierCost[]) => {
  let paidAmount = 0;
  let pendingAmount = 0;
  let paidCount = 0;
  let pendingCount = 0;
  for (const i of items) {
    const status = (i.payment_status || '').toLowerCase();
    const total = Number(i.total_amount) || 0;
    const paid = Number(i.paid_amount) || 0;
    if (status === 'paid') {
      paidAmount += paid;
      paidCount += 1;
    } else {
      pendingAmount += Math.max(total - paid, 0);
      pendingCount += 1;
    }
  }
  return { paidAmount, pendingAmount, paidCount, pendingCount };
};

export const groupSupplierCostsByEvent = (costs: SupplierCost[], events: EventLite[]): GroupedEventCosts[] => {
  const eventsById = new Map(events.map(e => [e.id, e]));
  const byEvent = new Map<string, SupplierCost[]>();
  for (const c of costs) {
    const arr = byEvent.get(c.event_id) || [];
    arr.push(c);
    byEvent.set(c.event_id, arr);
  }
  const groups: GroupedEventCosts[] = [];
  for (const [eventId, items] of byEvent.entries()) {
    const ev = eventsById.get(eventId);
    const totals = calcEventSupplierTotals(items);
    groups.push({
      eventId,
      name: ev?.name || 'Evento',
      start_date: ev?.start_date,
      end_date: ev?.end_date,
      totals,
      items: items,
    });
  }
  return groups;
};

export const getSupplierCostDate = (c: SupplierCost): Date => {
  const base = (c.payment_status || '').toLowerCase() === 'paid' ? c.payment_date : c.created_at;
  return base ? new Date(base as any) : new Date(0);
};

export const sortSupplierCostsByLatest = (items: SupplierCost[]): SupplierCost[] => {
  return [...items].sort((a, b) => getSupplierCostDate(b).getTime() - getSupplierCostDate(a).getTime());
};
