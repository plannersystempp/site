import { useEffect, useMemo, useState } from 'react';
import { buildFilterKey as buildKeyUtil, loadFilterValue, saveFilterValue, resetFilterValue, type StorageLike as StorageUtil } from '../utils/persistence';

export type StorageLike = StorageUtil;

export interface PersistentFilterOptions<T extends string> {
  userId?: string | number | null;
  teamId?: string | number | null;
  filterName: string;
  defaultValue: T;
  storage?: StorageLike;
}

const buildKey = (opts: PersistentFilterOptions<any>) => buildKeyUtil(opts.userId, opts.teamId, opts.filterName);

export function usePersistentFilter<T extends string>(opts: PersistentFilterOptions<T>) {
  const storage: StorageLike | undefined = opts.storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  const key = useMemo(() => buildKey(opts), [opts.userId, opts.teamId, opts.filterName]);

  const [value, setValue] = useState<T>(() => loadFilterValue(storage, key, opts.defaultValue));

  useEffect(() => {
    saveFilterValue(storage, key, value);
  }, [key, value, storage]);

  const reset = () => {
    setValue(opts.defaultValue);
    resetFilterValue(storage, key);
  };

  return { value, setValue, reset } as const;
}