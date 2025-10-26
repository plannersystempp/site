/**
 * Verifica se uma data está dentro do período do evento
 */
export const isDateWithinEventPeriod = (date: string, event: { start_date?: string; end_date?: string }): boolean => {
  if (!date || !event?.start_date || !event?.end_date) return false;
  
  const checkDate = new Date(date + 'T12:00:00');
  const startDate = new Date(event.start_date + 'T12:00:00');
  const endDate = new Date(event.end_date + 'T12:00:00');
  
  return checkDate >= startDate && checkDate <= endDate;
};

/**
 * Verifica se uma data está no array de work_days da alocação
 */
export const isDateInAllocation = (date: string, workDays: string[]): boolean => {
  if (!date || !workDays?.length) return false;
  return workDays.includes(date);
};

/**
 * Retorna apenas as datas válidas (dentro do evento E nos work_days)
 */
export const getValidWorkDatesForAllocation = (
  workDays: string[],
  event: { start_date?: string; end_date?: string }
): string[] => {
  if (!workDays?.length || !event) return [];
  
  return workDays.filter(date => isDateWithinEventPeriod(date, event));
};

/**
 * Formata data para exibição (dd/mm/yyyy)
 */
export const formatDateBR = (date: string): string => {
  if (!date) return '';
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
};
