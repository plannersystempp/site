// Idioma: pt-BR
import { useQuery } from '@tanstack/react-query';
import { useTeam } from '@/contexts/TeamContext';
import { fetchPaymentForecast, WeekForecast } from '@/services/paymentForecastService';

export const paymentForecastKeys = {
  all: ['payment-forecast'] as const,
  byTeam: (teamId?: string) => [...paymentForecastKeys.all, teamId] as const,
  withRange: (teamId: string, weeksAhead: number) => [...paymentForecastKeys.byTeam(teamId), weeksAhead] as const,
};

interface Options {
  weeksAhead?: number;
  enabled?: boolean;
}

export function usePaymentForecastQuery({ weeksAhead = 3, enabled = true }: Options = {}) {
  const { activeTeam } = useTeam();

  return useQuery({
    queryKey: activeTeam?.id ? paymentForecastKeys.withRange(activeTeam.id, weeksAhead) : paymentForecastKeys.all,
    queryFn: async (): Promise<WeekForecast[]> => {
      return fetchPaymentForecast({ teamId: activeTeam!.id, weeksAhead });
    },
    enabled: enabled && Boolean(activeTeam?.id),
    staleTime: 60_000,
  });
}