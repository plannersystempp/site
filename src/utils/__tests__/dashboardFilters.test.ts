// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { filterByDateRange, filterPaymentsByDateRange, filterPaymentsByStatus, sortByNearestDate, sortPaymentsByNearestDate } from '../../utils/dashboardFilters';

const now = new Date('2025-11-06T12:00:00Z');

describe('dashboardFilters', () => {
  it('filtra eventos por intervalo de 7 dias', () => {
    const items = [
      { id: '1', name: 'Hoje', start_date: '2025-11-06' },
      { id: '2', name: 'Amanhã', start_date: '2025-11-07' },
      { id: '3', name: '30 dias', start_date: '2025-12-06' },
    ];

    const result = filterByDateRange(items, '7dias', now);
    expect(result.map(i => i.id)).toEqual(['1', '2']);
  });

  it('filtra pagamentos por intervalo de 7 dias usando payment_due_date', () => {
    const items = [
      { id: '1', name: 'Hoje', payment_due_date: '2025-11-06' },
      { id: '2', name: 'Amanhã', payment_due_date: '2025-11-07' },
      { id: '3', name: '30 dias', payment_due_date: '2025-12-06' },
    ];

    const result = filterPaymentsByDateRange(items, '7dias', now);
    expect(result.map(i => i.id)).toEqual(['1', '2']);
  });

  it('filtra pagamentos hoje', () => {
    const items = [
      { id: '1', name: 'Hoje', payment_due_date: '2025-11-06' },
      { id: '2', name: 'Amanhã', payment_due_date: '2025-11-07' },
    ];

    const result = filterPaymentsByDateRange(items, 'hoje', now);
    expect(result.map(i => i.id)).toEqual(['1']);
  });

  it('filtra pagamentos por status pendente', () => {
    const items = [
      { id: '1', name: 'Pago', payment_status: 'paid', payment_due_date: '2025-11-10' },
      { id: '2', name: 'Pendente', payment_status: 'pending', payment_due_date: '2025-11-08' },
    ];
    const result = filterPaymentsByStatus(items, 'pendente', now);
    expect(result.map(i => i.id)).toEqual(['2']);
  });

  it('filtra pagamentos vencidos', () => {
    const items = [
      { id: '1', name: 'Vencido', payment_status: 'pending', payment_due_date: '2025-11-01' },
      { id: '2', name: 'Futuro', payment_status: 'pending', payment_due_date: '2025-11-20' },
      { id: '3', name: 'Pago', payment_status: 'paid', payment_due_date: '2025-11-01' },
    ];
    const result = filterPaymentsByStatus(items, 'vencido', now);
    expect(result.map(i => i.id)).toEqual(['1']);
  });

  it('ordena eventos por data mais próxima', () => {
    const items = [
      { id: '1', name: 'Distante', start_date: '2025-12-01' },
      { id: '2', name: 'Próximo', start_date: '2025-11-07' },
      { id: '3', name: 'Hoje', start_date: '2025-11-06' },
    ];
    const result = sortByNearestDate(items, now);
    expect(result.map(i => i.id)).toEqual(['3', '2', '1']);
  });

  it('ordena pagamentos por data de vencimento mais próxima', () => {
    const items = [
      { id: '1', name: 'Distante', payment_due_date: '2025-12-01' },
      { id: '2', name: 'Próximo', payment_due_date: '2025-11-07' },
      { id: '3', name: 'Hoje', payment_due_date: '2025-11-06' },
    ];
    const result = sortPaymentsByNearestDate(items, now);
    expect(result.map(i => i.id)).toEqual(['3', '2', '1']);
  });
});