import { useState, useEffect } from 'react';

interface SavedFilter {
  id: string;
  name: string;
  tab: string;
  filters: Record<string, any>;
  createdAt: string;
}

const STORAGE_KEY = 'superadmin_saved_filters';

export function useSavedFilters(currentTab: string) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedFilters(JSON.parse(stored));
      } catch (error) {
        console.error('Erro ao carregar filtros salvos:', error);
      }
    }
  }, []);

  const saveFilter = (name: string, filters: Record<string, any>) => {
    const newFilter: SavedFilter = {
      id: crypto.randomUUID(),
      name,
      tab: currentTab,
      filters,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getFiltersForTab = () => {
    return savedFilters.filter(f => f.tab === currentTab);
  };

  return {
    savedFilters: getFiltersForTab(),
    saveFilter,
    deleteFilter,
  };
}
