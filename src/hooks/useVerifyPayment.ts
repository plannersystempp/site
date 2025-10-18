import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VerifyPaymentParams {
  sessionId: string;
  teamId: string;
  planId: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  status: string;
  subscription?: {
    id: string;
    plan_name: string;
    period_start: string;
    period_end: string;
  };
  message?: string;
  error?: string;
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: async ({ sessionId, teamId, planId }: VerifyPaymentParams): Promise<VerifyPaymentResponse> => {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          sessionId,
          teamId,
          planId
        }
      });

      if (error) throw error;
      return data;
    }
  });
}
