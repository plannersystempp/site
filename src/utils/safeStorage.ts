/**
 * Utilitário para acesso seguro ao localStorage
 * Previne erros em Safari modo privado e quando storage está bloqueado
 */

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('[SafeStorage] Erro ao ler localStorage:', e);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('[SafeStorage] Erro ao escrever localStorage:', e);
      return false;
    }
  },
  
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('[SafeStorage] Erro ao remover do localStorage:', e);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('[SafeStorage] Erro ao limpar localStorage:', e);
    }
  }
};

/**
 * Verifica se localStorage está disponível
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};
