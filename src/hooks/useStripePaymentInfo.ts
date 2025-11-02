import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StripePaymentInfo {
  hasStripeData: boolean;
  message?: string;
  subscription?: {
    id: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    canceled_at: number | null;
  };
  paymentMethod?: {
    type: string;
    card?: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    };
  } | null;
  invoices?: Array<{
    id: string;
    amount_paid: number;
    amount_due: number;
    status: string;
    created: number;
    invoice_pdf: string | null;
    hosted_invoice_url: string | null;
  }>;
  upcomingInvoice?: {
    amount_due: number;
    period_end: number;
  } | null;
  stripeCustomerUrl?: string;
  stripeSubscriptionUrl?: string;
}

interface UseStripePaymentInfoOptions {
  subscriptionId: string;
  enabled?: boolean;
}

export function useStripePaymentInfo({ subscriptionId, enabled = true }: UseStripePaymentInfoOptions) {
  return useQuery({
    queryKey: ['stripe-payment-info', subscriptionId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('stripe-payment-info', {
        body: { subscriptionId },
      });

      if (error) throw error;
      return data as StripePaymentInfo;
    },
    enabled,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}
