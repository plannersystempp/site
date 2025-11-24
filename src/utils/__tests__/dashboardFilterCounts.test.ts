// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { countEventsByRanges, countPaymentsByRanges, countPaymentsByStatus, nextEventsPreview } from '../../utils/dashboardFilterCounts';

const now = new Date('2025-11-06T12:00:00Z');

describe('dashboardFilterCounts', () => {
  it('conta eventos por intervalos corretamente', () => {
    const events = [
      { id: '1', name: 'Hoje', start_date: '2025-11-06' },
      { id: '2', name: 'Amanhã', start_date: '2025-11-07' },
      { id: '3', name: '30 dias', start_date: '2025-12-06' },
    ];
    const counts = countEventsByRanges(events, now);
    expect(counts['7dias']).toBe(2);
    expect(counts['30dias']).toBe(3);
    expect(counts['hoje']).toBe(1);
    expect(counts['todos']).toBe(3);
  });

  it('conta pagamentos por intervalos corretamente', () => {
    const payments = [
      { id: '1', name: 'Hoje', payment_due_date: '2025-11-06' },
      { id: '2', name: 'Amanhã', payment_due_date: '2025-11-07' },
      { id: '3', name: '30 dias', payment_due_date: '2025-12-06' },
    ];
    const counts = countPaymentsByRanges(payments, now);
    expect(counts['7dias']).toBe(2);
    expect(counts['30dias']).toBe(3);
    expect(counts['hoje']).toBe(1);
    expect(counts['todos']).toBe(3);
  });

  it('conta pagamentos por status', () => {
    const payments = [
      { id: '1', name: 'Pago', payment_status: 'paid', payment_due_date: '2025-11-01' },
      { id: '2', name: 'Pendente Futuro', payment_status: 'pending', payment_due_date: '2025-11-20' },
      { id: '3', name: 'Pend Vencido', payment_status: 'pending', payment_due_date: '2025-11-01' },
    ];
    const counts = countPaymentsByStatus(payments, now);
    expect(counts['pago']).toBe(1);
    expect(counts['pendente']).toBe(2);
    expect(counts['vencido']).toBe(1);
    expect(counts['todos']).toBe(3);
  });

  it('gera preview dos próximos eventos limitado', () => {
    const events = [
      { id: '1', name: 'Hoje', start_date: '2025-11-06' },
      { id: '2', name: 'Amanhã', start_date: '2025-11-07' },
      { id: '3', name: 'Depois', start_date: '2025-11-09' },
      { id: '4', name: 'Distante', start_date: '2025-12-06' },
    ];
    const preview = nextEventsPreview(events, '30dias', 2, now);
    expect(preview.map(e => e.id)).toEqual(['1', '2']);
  });
});