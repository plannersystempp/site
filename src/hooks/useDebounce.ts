import { useCallback, useRef } from 'react';

interface DebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Hook para debounce de funções
 * Útil para limitar a frequência de operações como atualizações
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay = 500,
  options: DebounceOptions = {}
): T => {
  const { leading = false, trailing = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<{ args: Parameters<T>; thisArg: any } | null>(null);
  const lastInvokeTimeRef = useRef<number>(0);

  const debounced = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const shouldInvokeLeading = leading && now - lastInvokeTimeRef.current > delay;
    
    lastCallRef.current = { args, thisArg: this };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (shouldInvokeLeading) {
      lastInvokeTimeRef.current = now;
      return func.apply(this, args);
    }

    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        lastInvokeTimeRef.current = Date.now();
        if (lastCallRef.current) {
          func.apply(lastCallRef.current.thisArg, lastCallRef.current.args);
        }
      }, delay);
    }
  }, [func, delay, leading, trailing]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      cancel();
      if (lastCallRef.current) {
        lastInvokeTimeRef.current = Date.now();
        return func.apply(lastCallRef.current.thisArg, lastCallRef.current.args);
      }
    }
  }, [cancel, func]);

  return Object.assign(debounced as T, {
    cancel,
    flush
  });
};