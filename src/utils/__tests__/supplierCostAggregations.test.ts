import { describe, it, expect } from 'vitest';
import { groupSupplierCostsByEvent, calcEventSupplierTotals, filterSupplierCostsByStatus, SupplierCost, EventLite } from '@/utils/supplierCostAggregations';

const mkCost = (over: Partial<SupplierCost>): SupplierCost => ({
  id: Math.random().toString(36).slice(2),
  event_id: over.event_id || 'e1',
  supplier_name: over.supplier_name || 'Fornecedor',
  description: over.description || 'Desc',
  quantity: over.quantity ?? 1,
  unit_price: over.unit_price ?? 100,
  total_amount: over.total_amount ?? 100,
  paid_amount: over.paid_amount ?? 0,
  payment_status: over.payment_status || 'pending',
  payment_date: over.payment_date || null,
  created_at: over.created_at || new Date().toISOString(),
});

describe('supplierCostAggregations', () => {
  it('calcula totais de itens pagos e pendentes', () => {
    const items: SupplierCost[] = [
      mkCost({ payment_status: 'paid', paid_amount: 80, total_amount: 100 }),
      mkCost({ payment_status: 'pending', paid_amount: 20, total_amount: 100 }),
    ];
    const totals = calcEventSupplierTotals(items);
    expect(totals.paidAmount).toBe(80);
    expect(totals.pendingAmount).toBe(80);
    expect(totals.paidCount).toBe(1);
    expect(totals.pendingCount).toBe(1);
  });

  it('filtra por status corretamente', () => {
    const items: SupplierCost[] = [
      mkCost({ payment_status: 'paid' }),
      mkCost({ payment_status: 'pending' }),
    ];
    expect(filterSupplierCostsByStatus(items, 'todos')).toHaveLength(2);
    expect(filterSupplierCostsByStatus(items, 'pago')).toHaveLength(1);
    expect(filterSupplierCostsByStatus(items, 'pendente')).toHaveLength(1);
  });

  it('agrupa por evento e traz nomes', () => {
    const items: SupplierCost[] = [
      mkCost({ event_id: 'e1' }),
      mkCost({ event_id: 'e1' }),
      mkCost({ event_id: 'e2' }),
    ];
    const events: EventLite[] = [
      { id: 'e1', name: 'Evento 1' },
      { id: 'e2', name: 'Evento 2' },
    ];
    const groups = groupSupplierCostsByEvent(items, events);
    const g1 = groups.find(g => g.eventId === 'e1');
    const g2 = groups.find(g => g.eventId === 'e2');
    expect(g1?.name).toBe('Evento 1');
    expect(g1?.items.length).toBe(2);
    expect(g2?.name).toBe('Evento 2');
    expect(g2?.items.length).toBe(1);
  });
});

