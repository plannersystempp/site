export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const buildFilterKey = (userId: string | number | null | undefined, teamId: string | number | null | undefined, filterName: string) => {
  const u = userId ?? 'anon';
  const t = teamId ?? 'default';
  return `filters:${u}:${t}:${filterName}`;
};

export const loadFilterValue = <T extends string>(storage: StorageLike | undefined, key: string, defaultValue: T): T => {
  if (!storage) return defaultValue;
  const raw = storage.getItem(key);
  return (raw as T) ?? defaultValue;
};

export const saveFilterValue = <T extends string>(storage: StorageLike | undefined, key: string, value: T): void => {
  if (!storage) return;
  storage.setItem(key, value);
};

export const resetFilterValue = (storage: StorageLike | undefined, key: string): void => {
  if (!storage) return;
  storage.removeItem(key);
};