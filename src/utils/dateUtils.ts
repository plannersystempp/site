export const formatDateBR = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
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
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const formatDateWithWeekday = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
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
  const date = new Date(dateStr);
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
  const date = new Date(dateStr);
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