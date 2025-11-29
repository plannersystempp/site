import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000, // Reduzido de 30s para 5s para sincronização mais rápida
      gcTime: 5 * 60 * 1000, // Reduzido de 10min para 5min
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: true, // Ativado para sincronização ao focar na janela
      refetchOnReconnect: true,
      refetchOnMount: true, // Garante que sempre busque dados frescos ao montar componente
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});