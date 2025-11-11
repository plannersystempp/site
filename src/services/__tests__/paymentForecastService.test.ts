// Idioma: pt-BR
import { describe, it, expect } from 'vitest';
import { groupItemsByWeek, getWeekRangeForDate, ForecastItem } from '../paymentForecastUtils';

describe('paymentForecastService - agrupamento por semana', () => {
  it('deve calcular corretamente o intervalo semanal (segunda a domingo)', () => {
    const range = getWeekRangeForDate('2025-11-10'); // 10/nov/2025 é segunda
    expect(range).toEqual({ start: '2025-11-10', end: '2025-11-16' });

    const rangeWed = getWeekRangeForDate('2025-11-12'); // quarta
    expect(rangeWed).toEqual({ start: '2025-11-10', end: '2025-11-16' });
  });

  it('deve agrupar itens com dueDate na mesma semana e somar total', () => {
    const items: ForecastItem[] = [
      { kind: 'evento', id: 'e1', name: 'Evento A', location: 'Casa Firjan', dueDate: '2025-11-10', amount: 12250 },
      { kind: 'evento', id: 'e2', name: 'Evento B', location: 'Firjan Sede', dueDate: '2025-11-10', amount: 800 },
      { kind: 'avulso', id: 'p1', name: 'Pagamento X', dueDate: '2025-11-19', amount: 800 },
      { kind: 'avulso', id: 'p2', name: 'Pagamento Y', dueDate: '2025-11-20', amount: 360 },
    ];

    const weeks = groupItemsByWeek(items);
    expect(weeks.length).toBe(2);
    expect(weeks[0]).toMatchObject({ weekStart: '2025-11-10', weekEnd: '2025-11-16' });
    expect(weeks[0].totalAmount).toBe(13050);
    expect(weeks[1]).toMatchObject({ weekStart: '2025-11-17', weekEnd: '2025-11-23' });
    expect(weeks[1].totalAmount).toBe(1160);
  });
});