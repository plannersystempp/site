/**
 * Cache simples para status de eventos com TTL de 30 segundos
 * Reduz queries redundantes ao banco de dados
 */

import { supabase } from '@/integrations/supabase/client';

const CACHE_TTL = 30000; // 30 segundos

interface EventStatusData {
  event_id: string;
  event_name: string;
  event_status: string;
  end_date: string;
  payment_due_date: string | null;
  allocated_count: number;
  paid_count: number;
  has_pending_payments: boolean;
}

interface CacheEntry {
  data: EventStatusData[];
  timestamp: number;
  teamId: string;
}

let cache: CacheEntry | null = null;

/**
 * Obtém status de eventos com cache inteligente
 * @param teamId - ID da equipe para buscar eventos
 * @returns Array com status dos eventos
 */
export const getCachedEventStatus = async (
  teamId: string
): Promise<EventStatusData[]> => {
  const now = Date.now();

  // Retornar cache se ainda válido e para a mesma equipe
  if (
    cache &&
    cache.teamId === teamId &&
    now - cache.timestamp < CACHE_TTL
  ) {
    console.log('[EventStatusCache] Retornando dados do cache');
    return cache.data;
  }

  console.log('[EventStatusCache] Cache expirado ou inválido, buscando do banco');

  try {
    const { data, error } = await supabase.rpc(
      'get_events_with_payment_status',
      { p_team_id: teamId }
    );

    if (error) {
      console.error('[EventStatusCache] Erro ao buscar eventos:', error);
      throw error;
    }

    // Atualizar cache
    cache = {
      data: data || [],
      timestamp: now,
      teamId
    };

    return cache.data;
  } catch (error) {
    console.error('[EventStatusCache] Falha ao buscar status de eventos:', error);
    
    // Em caso de erro, retornar cache antigo se existir (fallback)
    if (cache && cache.teamId === teamId) {
      console.warn('[EventStatusCache] Retornando cache expirado como fallback');
      return cache.data;
    }
    
    throw error;
  }
};

/**
 * Invalida o cache manualmente
 * Útil após operações que modificam status de pagamento
 */
export const invalidateCache = (): void => {
  console.log('[EventStatusCache] Cache invalidado manualmente');
  cache = null;
};

/**
 * Verifica se o cache está válido
 * @param teamId - ID da equipe para verificar
 * @returns true se o cache está válido
 */
export const isCacheValid = (teamId: string): boolean => {
  if (!cache || cache.teamId !== teamId) return false;
  const now = Date.now();
  return now - cache.timestamp < CACHE_TTL;
};

/**
 * Obtém informações sobre o estado do cache (útil para debugging)
 */
export const getCacheInfo = () => {
  if (!cache) {
    return { cached: false, message: 'Cache vazio' };
  }

  const now = Date.now();
  const age = now - cache.timestamp;
  const remaining = Math.max(0, CACHE_TTL - age);

  return {
    cached: true,
    teamId: cache.teamId,
    itemCount: cache.data.length,
    ageMs: age,
    remainingMs: remaining,
    isValid: remaining > 0
  };
};
