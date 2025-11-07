import { filterByDateRange, filterPaymentsByStatus, sortByNearestDate, type DateRange, type PaymentStatusFilter } from './dashboardFilters';

interface EventLike {
  id: string;
  name: string;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
}

interface PaymentLike extends EventLike {
  payment_due_date?: string | Date | null;
  payment_status?: 'pending' | 'paid' | 'overdue' | string | null;
}

export const countEventsByRanges = (events: EventLike[], now = new Date()): Record<DateRange, number> => {
  return {
    hoje: filterByDateRange(events, 'hoje', now).length,
    '7dias': filterByDateRange(events, '7dias', now).length,
    '30dias': filterByDateRange(events, '30dias', now).length,
    todos: events.length,
  };
};

export const countPaymentsByStatus = (payments: PaymentLike[], now = new Date()): Record<PaymentStatusFilter, number> => {
  return {
    pendente: filterPaymentsByStatus(payments, 'pendente', now).length,
    vencido: filterPaymentsByStatus(payments, 'vencido', now).length,
    pago: filterPaymentsByStatus(payments, 'pago', now).length,
    todos: payments.length,
  };
};

export const nextEventsPreview = (events: EventLike[], range: DateRange, limit = 5, now = new Date()): EventLike[] => {
  return sortByNearestDate(filterByDateRange(events, range, now), now).slice(0, limit);
};