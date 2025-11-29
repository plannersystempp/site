import { useRef, useEffect, useState } from 'react';

interface ScrollState {
  x: number;
  y: number;
}

interface UIStateBackup {
  scrollPosition: ScrollState;
  focusedElement: string | null;
  selectedText: string | null;
  formData: Record<string, any>;
}

/**
 * Hook para preservar estado da UI durante atualizações
 * Mantém posição de rolagem, foco e dados de formulários
 */
export const useUIStatePreservation = () => {
  const stateBackupRef = useRef<UIStateBackup | null>(null);
  const [isPreserving, setIsPreserving] = useState(false);

  const backupUIState = () => {
    const backup: UIStateBackup = {
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY
      },
      focusedElement: document.activeElement?.id || null,
      selectedText: window.getSelection()?.toString() || null,
      formData: {}
    };

    // Salvar dados de formulários importantes
    const forms = document.querySelectorAll('form[data-preserve]');
    forms.forEach(form => {
      const formId = form.id || 'default';
      const formData = new FormData(form as HTMLFormElement);
      const data: Record<string, any> = {};
      
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      backup.formData[formId] = data;
    });

    stateBackupRef.current = backup;
    setIsPreserving(true);
  };

  const restoreUIState = () => {
    if (!stateBackupRef.current) return;

    const backup = stateBackupRef.current;

    // Restaurar posição de rolagem
    window.scrollTo({
      left: backup.scrollPosition.x,
      top: backup.scrollPosition.y,
      behavior: 'auto' // Sem animação para restauração instantânea
    });

    // Restaurar foco do elemento
    if (backup.focusedElement) {
      const element = document.getElementById(backup.focusedElement);
      if (element) {
        element.focus();
      }
    }

    // Restaurar dados de formulários
    Object.entries(backup.formData).forEach(([formId, data]) => {
      const form = document.querySelector(`form[data-preserve]#${formId}`) || 
                   document.querySelector('form[data-preserve]');
      
      if (form) {
        Object.entries(data).forEach(([key, value]) => {
          const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
          if (input) {
            input.value = String(value);
          }
        });
      }
    });

    setIsPreserving(false);
  };

  const clearBackup = () => {
    stateBackupRef.current = null;
    setIsPreserving(false);
  };

  return {
    backupUIState,
    restoreUIState,
    clearBackup,
    isPreserving,
    hasBackup: !!stateBackupRef.current
  };
};