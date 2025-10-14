
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Apply Brazilian phone number formatting
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

export const formatWhatsAppNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it's a Brazilian number without country code, add 55
  if (cleaned.length === 11 || cleaned.length === 10) {
    return `55${cleaned}`;
  }
  
  // If it already has a country code or is in another format, return as is
  return cleaned;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('pt-BR');
};

/**
 * Parse hours input in various formats:
 * - "2" ou "2.5" (horas decimais)
 * - "02:30" (formato HH:MM)
 * Retorna valor decimal (ex: 2.5 para 2h30min)
 */
export const parseHoursInput = (input: string): number => {
  if (!input || input.trim() === '') return 0;
  
  const trimmed = input.trim();
  
  // Formato HH:MM (ex: "02:30")
  if (trimmed.includes(':')) {
    const [hours, minutes] = trimmed.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours + (minutes / 60);
  }
  
  // Formato decimal (ex: "2.5")
  const decimal = parseFloat(trimmed.replace(',', '.'));
  return isNaN(decimal) ? 0 : decimal;
};

/**
 * Formata horas decimais para formato legível
 * 2.5 => "02:30"
 * 1.75 => "01:45"
 * 0 => "00:00"
 */
export const formatHours = (hours: number): string => {
  if (isNaN(hours) || hours < 0) return '00:00';
  
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
