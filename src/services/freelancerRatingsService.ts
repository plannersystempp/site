import { supabase } from '@/integrations/supabase/client';

export interface EligibilityResult {
  canRate: boolean;
  reason?: 'alreadyRated' | 'cooldown' | 'missingParams';
  cooldownEndsAt?: string; // ISO string
}

export interface RatingMetrics {
  average: number;
  count: number;
  distribution: Record<number, number>; // 1..5
  lastRatingAt?: string; // ISO
  averageIntervalMs?: number; // média de intervalo entre avaliações
}

export const DEFAULT_RATING_COOLDOWN_MINUTES = 60; // 1h

export async function checkFreelancerRatingEligibility(params: {
  teamId?: string;
  freelancerId?: string;
  eventId?: string;
  userId?: string;
  cooldownMinutes?: number;
}): Promise<EligibilityResult> {
  const { teamId, freelancerId, eventId, userId } = params;
  const cooldownMinutes = params.cooldownMinutes ?? DEFAULT_RATING_COOLDOWN_MINUTES;

  if (!teamId || !freelancerId || !userId || !eventId) {
    return { canRate: false, reason: 'missingParams' };
  }

  // 1) Checar duplicidade por usuário/evento/freelancer
  const { data: existingForEvent, error: dupError } = await supabase
    .from('freelancer_ratings')
    .select('id, created_at')
    .eq('team_id', teamId)
    .eq('freelancer_id', freelancerId)
    .eq('event_id', eventId)
    .eq('rated_by_id', userId)
    .limit(1);

  if (dupError) throw dupError;
  if (existingForEvent && existingForEvent.length > 0) {
    return { canRate: false, reason: 'alreadyRated', cooldownEndsAt: existingForEvent[0].created_at };
  }

  // 2) Checar cooldown: última avaliação feita pelo usuário para este freelancer
  const { data: lastUserRating, error: lastError } = await supabase
    .from('freelancer_ratings')
    .select('created_at')
    .eq('team_id', teamId)
    .eq('freelancer_id', freelancerId)
    .eq('rated_by_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (lastError) throw lastError;
  if (lastUserRating && lastUserRating.length > 0) {
    const lastAt = new Date(lastUserRating[0].created_at);
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const endsAt = new Date(lastAt.getTime() + cooldownMs);
    const now = new Date();
    if (now < endsAt) {
      return { canRate: false, reason: 'cooldown', cooldownEndsAt: endsAt.toISOString() };
    }
  }

  return { canRate: true };
}

export async function getFreelancerRatingMetrics(teamId: string, freelancerId: string): Promise<RatingMetrics> {
  if (!teamId || !freelancerId) {
    return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const { data, error } = await supabase
    .from('freelancer_ratings')
    .select('rating, created_at')
    .eq('team_id', teamId)
    .eq('freelancer_id', freelancerId);

  if (error) throw error;

  if (!data || data.length === 0) {
    return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const count = data.length;
  const total = data.reduce((sum, r) => sum + (r.rating ?? 0), 0);
  const average = total / count;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of data) {
    const val = Math.max(1, Math.min(5, r.rating ?? 0));
    distribution[val] = (distribution[val] ?? 0) + 1;
  }

  const sortedByDate = [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const lastRatingAt = sortedByDate[sortedByDate.length - 1]?.created_at;

  // média de intervalo entre avaliações
  let averageIntervalMs: number | undefined = undefined;
  if (sortedByDate.length >= 2) {
    let totalInterval = 0;
    for (let i = 1; i < sortedByDate.length; i++) {
      const prev = new Date(sortedByDate[i - 1].created_at).getTime();
      const curr = new Date(sortedByDate[i].created_at).getTime();
      totalInterval += (curr - prev);
    }
    averageIntervalMs = totalInterval / (sortedByDate.length - 1);
  }

  return { average, count, distribution, lastRatingAt, averageIntervalMs };
}