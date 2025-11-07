// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { buildFilterKey, loadFilterValue, saveFilterValue, resetFilterValue } from '../../utils/persistence';

const createStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
  };
};

describe('persistence utils', () => {
  it('buildFilterKey gera chave escopada', () => {
    const key = buildFilterKey('u1', 't1', 'intervalo');
    expect(key).toBe('filters:u1:t1:intervalo');
  });

  it('load/save/reset funciona com storage mock', () => {
    const storage = createStorage();
    const key = 'filters:anon:default:intervalo';
    const defaultValue = 'todos';
    expect(loadFilterValue(storage, key, defaultValue)).toBe('todos');
    saveFilterValue(storage, key, '7dias');
    expect(loadFilterValue(storage, key, defaultValue)).toBe('7dias');
    resetFilterValue(storage, key);
    expect(loadFilterValue(storage, key, defaultValue)).toBe('todos');
  });
});