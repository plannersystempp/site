/**
 * Hook para validação real-time de CPF
 * Fase 4: Validação assíncrona que verifica duplicidade enquanto o usuário digita
 * Fase 5: Com debounce de 500ms para otimização
 */

import { useState, useEffect, useCallback } from 'react';
import { validateCPF } from '@/utils/validation';
import { usePersonnelQuery } from './queries/usePersonnelQuery';
import { logger } from '@/utils/logger';

interface CPFValidationResult {
  isValid: boolean;
  message: string;
  isChecking: boolean;
}

const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const useCPFValidation = (cpf: string, currentPersonnelId?: string) => {
  const { data: allPersonnel = [] } = usePersonnelQuery();
  const [result, setResult] = useState<CPFValidationResult>({
    isValid: true,
    message: '',
    isChecking: false,
  });

  const validate = useCallback(async () => {
    const cleanCPF = removeNonNumeric(cpf);

    // Se vazio, não validar
    if (!cleanCPF) {
      setResult({ isValid: true, message: '', isChecking: false });
      return;
    }

    setResult(prev => ({ ...prev, isChecking: true }));

    // Validar formato
    if (!validateCPF(cleanCPF)) {
      logger.validation.cpf(false, 'Formato inválido');
      setResult({
        isValid: false,
        message: 'CPF inválido',
        isChecking: false,
      });
      return;
    }

    // Validar unicidade (assíncrono simulado - na prática já temos os dados)
    const isDuplicate = allPersonnel.some(
      person => 
        person.id !== currentPersonnelId && 
        removeNonNumeric(person.cpf || '') === cleanCPF
    );

    if (isDuplicate) {
      logger.validation.cpf(false, 'CPF já cadastrado');
      setResult({
        isValid: false,
        message: 'CPF já cadastrado',
        isChecking: false,
      });
      return;
    }

    // Tudo OK
    logger.validation.cpf(true, 'CPF válido');
    setResult({
      isValid: true,
      message: '',
      isChecking: false,
    });
  }, [cpf, allPersonnel, currentPersonnelId]);

  // FASE 5: Debounce de 500ms para otimização
  useEffect(() => {
    const timer = setTimeout(() => {
      validate();
    }, 500);

    return () => clearTimeout(timer);
  }, [validate]);

  return result;
};
