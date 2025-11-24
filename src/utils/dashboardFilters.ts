// Utilidades puras de filtros do dashboard (TDD)
// Idioma: pt-BR

export type DateRange = 'hoje' | '7dias' | '30dias' | 'todos';
export type PaymentStatusFilter = 'pendente' | 'vencido' | 'pago' | 'todos';

interface EventLike {
  id: string;
  name: string;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  status?: string;
}

interface PaymentLike extends EventLike {
  payment_due_date?: string | Date | null;
  payment_status?: 'pending' | 'paid' | 'overdue' | string | null;
}

const toDate = (d?: string | Date | null) => (d ? new Date(d) : null);

export const filterByDateRange = <T extends EventLike>(items: T[], range: DateRange, now = new Date()): T[] => {
  if (range === 'todos') return items;
  const start = new Date(now);
  const end = new Date(now);
  if (range === 'hoje') {
    // Apenas eventos com start_date hoje ou futuro de hoje
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (range === '7dias') {
    end.setDate(end.getDate() + 7);
  } else if (range === '30dias') {
    end.setDate(end.getDate() + 30);
  }

  return items.filter(item => {
    const s = toDate(item.start_date) || toDate(item.end_date);
    if (!s) return false;
    return s >= start && s <= end;
  });
};

export const filterPaymentsByStatus = (items: PaymentLike[], status: PaymentStatusFilter, now = new Date()): PaymentLike[] => {
  if (status === 'todos') return items;

  return items.filter(item => {
    const st = (item.payment_status || '').toLowerCase();
    const due = toDate(item.payment_due_date) || toDate(item.end_date);

    if (status === 'pago') return st === 'paid';
    if (status === 'pendente') return st === 'pending';
    if (status === 'vencido') {
      if (!due) return false;
      // Considerar vencido: pending com due passado
      return st !== 'paid' && due < now;
    }
    return true;
  });
};

// Filtrar PAGAMENTOS por intervalo de datas usando payment_due_date
export const filterPaymentsByDateRange = <T extends PaymentLike>(items: T[], range: DateRange, now = new Date()): T[] => {
  if (range === 'todos') return items;
  const start = new Date(now);
  const end = new Date(now);
  
  if (range === 'hoje') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (range === '7dias') {
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);
  } else if (range === '30dias') {
    end.setDate(end.getDate() + 30);
    end.setHours(23, 59, 59, 999);
  }

  return items.filter(item => {
    // Para pagamentos, priorizar payment_due_date
    const dueDate = toDate(item.payment_due_date) || toDate(item.end_date);
    if (!dueDate) return false;
    return dueDate >= start && dueDate <= end;
  });
};

export const sortByNearestDate = <T extends { start_date?: string | Date | null; end_date?: string | Date | null }>(items: T[], now = new Date()): T[] => {
  return [...items].sort((a, b) => {
    const da = toDate(a.start_date) || toDate(a.end_date) || now;
    const db = toDate(b.start_date) || toDate(b.end_date) || now;
    return da.getTime() - db.getTime();
  });
};

// Ordenar PAGAMENTOS pela data de vencimento mais próxima
export const sortPaymentsByNearestDate = <T extends PaymentLike>(items: T[], now = new Date()): T[] => {
  return [...items].sort((a, b) => {
    const da = toDate(a.payment_due_date) || toDate(a.end_date) || now;
    const db = toDate(b.payment_due_date) || toDate(b.end_date) || now;
    return da.getTime() - db.getTime();
  });
};