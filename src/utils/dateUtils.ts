// Helper: parse date strings from Supabase and various formats safely
export const parseDateSafe = (input: string): Date => {
  if (!input) return new Date(NaN);
  const s = String(input).trim();

  // Numeric timestamp
  if (/^\d+$/.test(s)) {
    const ts = parseInt(s, 10);
    return new Date(ts);
  }

  let normalized = s;

  // Replace space between date and time with 'T' (supports milliseconds: '2025-12-04 13:19:41.753+00')
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}(:\d{2})?)?$/.test(s)) {
    normalized = s.replace(' ', 'T');
  }

  // Date-only string → set midday to avoid TZ shifts
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    normalized = `${normalized}T12:00:00`;
  }

  // Timezone without colon (e.g., +00) → add :00
  if (/[+-]\d{2}$/.test(normalized)) {
    normalized = `${normalized}:00`;
  }

  let d = new Date(normalized);
  if (isNaN(d.getTime())) {
    // Fallback: convert +00:00 → Z
    const zAttempt = normalized.replace(/[+-]00:00$/, 'Z').replace(/[+-]00$/, 'Z');
    d = new Date(zAttempt);
  }
  return d;
};

export const formatDateBR = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = parseDateSafe(dateStr);
  if (isNaN(date.getTime())) {
    console.error('Data inválida em formatDateBR:', dateStr);
    return '';
  }
  return date.toLocaleDateString('pt-BR');
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return '';
  return `${formatDateBR(startDate)} à ${formatDateBR(endDate)}`;
};

export const generateDateArray = (startDate: string, endDate: string): string[] => {
  if (!startDate || !endDate) return [];
  
  const dates: string[] = [];
  const start = parseDateSafe(startDate);
  const end = parseDateSafe(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
  
  const current = new Date(start.getTime());
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const formatDateWithWeekday = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = parseDateSafe(dateStr);
  if (isNaN(date.getTime())) {
    console.error('Data inválida em formatDateWithWeekday:', dateStr);
    return '';
  }
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  });
};

export const formatDateLong = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = parseDateSafe(dateStr);
  if (isNaN(date.getTime())) {
    console.error('Data inválida em formatDateLong:', dateStr);
    return '';
  }
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = parseDateSafe(dateStr);
  if (isNaN(date.getTime())) {
    console.error('Data inválida em formatDateShort:', dateStr);
    return '';
  }
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};