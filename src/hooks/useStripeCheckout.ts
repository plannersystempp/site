import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateCheckoutParams {
  planId: string;
  teamId: string;
}

export function useStripeCheckout() {
  return useMutation({
    mutationFn: async ({ planId, teamId }: CreateCheckoutParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const origin = window.location.origin;
      const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}&team=${teamId}`;
      const cancelUrl = `${origin}/plans?payment=canceled`;

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId,
          teamId,
          successUrl,
          cancelUrl
        }
      });

      if (error) {
        try {
          const res = (error as any)?.context?.response as Response | undefined;
          if (res) {
            const cloned = res.clone();
            let body: any = undefined;
            try {
              body = await cloned.json();
            } catch {
              try {
                const text = await cloned.text();
                body = JSON.parse(text);
              } catch {
                // ignore
              }
            }
            const serverMsg = body?.error || body?.details || body?.message;
            throw new Error(serverMsg || (error as any)?.message || 'Falha ao iniciar o checkout');
          }
        } catch {}
        const ctx: any = (error as any)?.context?.body;
        const serverMsg = ctx?.error || ctx?.details || ctx?.message;
        throw new Error(serverMsg || (error as any)?.message || 'Falha ao iniciar o checkout');
      }
      if (!data?.url) throw new Error('URL do checkout não retornada');

      return data;
    },
    onError: (error: Error) => {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
