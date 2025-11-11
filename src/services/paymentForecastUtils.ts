// Idioma: pt-BR
export type ForecastKind = 'evento' | 'avulso';

export interface ForecastItem {
  kind: ForecastKind;
  id: string;
  name: string;
  location?: string | null;
  dueDate: string; // ISO YYYY-MM-DD
  amount: number;
  notes?: string | null;
  personnelName?: string | null;
}

export interface WeekForecast {
  weekStart: string; // YYYY-MM-DD (segunda)
  weekEnd: string;   // YYYY-MM-DD (domingo)
  items: ForecastItem[];
  totalAmount: number;
}

// Helper puro: obtém segunda-feira para uma data (local, fixando meio-dia)
export const getWeekRangeForDate = (dateStr: string): { start: string; end: string } => {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const toIso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  return { start: toIso(start), end: toIso(end) };
};

// Agrupa itens por semana de vencimento
export const groupItemsByWeek = (items: ForecastItem[]): WeekForecast[] => {
  const map = new Map<string, WeekForecast>();
  for (const item of items) {
    const { start, end } = getWeekRangeForDate(item.dueDate);
    const key = `${start}_${end}`;
    if (!map.has(key)) {
      map.set(key, { weekStart: start, weekEnd: end, items: [], totalAmount: 0 });
    }
    const wk = map.get(key)!;
    wk.items.push(item);
    wk.totalAmount += item.amount;
  }
  return Array.from(map.values()).sort((a, b) => (a.weekStart < b.weekStart ? -1 : a.weekStart > b.weekStart ? 1 : 0));
};