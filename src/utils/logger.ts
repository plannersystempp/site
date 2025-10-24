/**
 * Sistema de Logs Estruturados
 * Fase 6: Logs organizados por módulo, apenas em desenvolvimento
 * 
 * Uso:
 * import { logger } from '@/utils/logger';
 * logger.personnel.create({ name: 'João' });
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  module: string;
  action: string;
  level: LogLevel;
  data?: any;
  timestamp: string;
}

const formatLog = (entry: LogEntry): void => {
  if (!isDev) return;

  const emoji = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    debug: '🔍'
  };

  const prefix = `${emoji[entry.level]} [${entry.module}:${entry.action}]`;
  const timestamp = new Date(entry.timestamp).toLocaleTimeString('pt-BR');

  switch (entry.level) {
    case 'error':
      console.error(prefix, entry.data || '', `(${timestamp})`);
      break;
    case 'warn':
      console.warn(prefix, entry.data || '', `(${timestamp})`);
      break;
    case 'debug':
      console.debug(prefix, entry.data || '', `(${timestamp})`);
      break;
    default:
      console.log(prefix, entry.data || '', `(${timestamp})`);
  }
};

const createModuleLogger = (module: string) => ({
  info: (action: string, data?: any) => formatLog({
    module,
    action,
    level: 'info',
    data,
    timestamp: new Date().toISOString()
  }),
  warn: (action: string, data?: any) => formatLog({
    module,
    action,
    level: 'warn',
    data,
    timestamp: new Date().toISOString()
  }),
  error: (action: string, data?: any) => formatLog({
    module,
    action,
    level: 'error',
    data,
    timestamp: new Date().toISOString()
  }),
  debug: (action: string, data?: any) => formatLog({
    module,
    action,
    level: 'debug',
    data,
    timestamp: new Date().toISOString()
  }),
});

export const logger = {
  personnel: {
    ...createModuleLogger('Personnel'),
    fetch: (data?: any) => formatLog({
      module: 'Personnel',
      action: 'FETCH',
      level: 'info',
      data,
      timestamp: new Date().toISOString()
    }),
    create: (data?: any) => formatLog({
      module: 'Personnel',
      action: 'CREATE',
      level: 'info',
      data,
      timestamp: new Date().toISOString()
    }),
    update: (data?: any) => formatLog({
      module: 'Personnel',
      action: 'UPDATE',
      level: 'info',
      data,
      timestamp: new Date().toISOString()
    }),
    delete: (data?: any) => formatLog({
      module: 'Personnel',
      action: 'DELETE',
      level: 'info',
      data,
      timestamp: new Date().toISOString()
    }),
    optimistic: (data?: any) => formatLog({
      module: 'Personnel',
      action: 'OPTIMISTIC',
      level: 'debug',
      data,
      timestamp: new Date().toISOString()
    }),
  },
  
  realtime: {
    ...createModuleLogger('Realtime'),
    connected: () => formatLog({
      module: 'Realtime',
      action: 'CONNECTED',
      level: 'info',
      timestamp: new Date().toISOString()
    }),
    change: (type: string, data?: any) => formatLog({
      module: 'Realtime',
      action: `CHANGE_${type}`,
      level: 'debug',
      data,
      timestamp: new Date().toISOString()
    }),
  },

  query: {
    ...createModuleLogger('Query'),
    start: (queryKey: string) => formatLog({
      module: 'Query',
      action: 'START',
      level: 'debug',
      data: queryKey,
      timestamp: new Date().toISOString()
    }),
    success: (queryKey: string, count?: number) => formatLog({
      module: 'Query',
      action: 'SUCCESS',
      level: 'info',
      data: `${queryKey} (${count} records)`,
      timestamp: new Date().toISOString()
    }),
    error: (queryKey: string, error: any) => formatLog({
      module: 'Query',
      action: 'ERROR',
      level: 'error',
      data: { queryKey, error },
      timestamp: new Date().toISOString()
    }),
  },

  validation: {
    ...createModuleLogger('Validation'),
    cpf: (isValid: boolean, message?: string) => formatLog({
      module: 'Validation',
      action: 'CPF',
      level: isValid ? 'debug' : 'warn',
      data: message,
      timestamp: new Date().toISOString()
    }),
  },

  cache: {
    ...createModuleLogger('Cache'),
    hit: (key: string) => formatLog({
      module: 'Cache',
      action: 'HIT',
      level: 'debug',
      data: key,
      timestamp: new Date().toISOString()
    }),
    miss: (key: string) => formatLog({
      module: 'Cache',
      action: 'MISS',
      level: 'debug',
      data: key,
      timestamp: new Date().toISOString()
    }),
    invalidate: (key: string) => formatLog({
      module: 'Cache',
      action: 'INVALIDATE',
      level: 'debug',
      data: key,
      timestamp: new Date().toISOString()
    }),
  }
};

// Helper para medir performance
export const measurePerformance = (label: string, fn: () => any) => {
  if (!isDev) return fn();
  
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  console.log(`⏱️ [Performance] ${label}: ${duration.toFixed(2)}ms`);
  
  return result;
};

// Helper para medir performance assíncrona
export const measurePerformanceAsync = async (label: string, fn: () => Promise<any>) => {
  if (!isDev) return await fn();
  
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  console.log(`⏱️ [Performance] ${label}: ${duration.toFixed(2)}ms`);
  
  return result;
};
