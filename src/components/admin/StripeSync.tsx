import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function StripeSync() {
  const [subscriptionId, setSubscriptionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!subscriptionId.trim()) {
      toast({
        title: 'ID obrigatório',
        description: 'Insira o ID da assinatura para sincronizar',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('sync-stripe-subscription', {
        body: { subscriptionId: subscriptionId.trim() },
      });

      if (invokeError) throw invokeError;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.subscription);
      toast({
        title: 'Sincronização concluída',
        description: `Assinatura sincronizada com status: ${data.subscription.mapped_status}`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao sincronizar';
      setError(errorMsg);
      toast({
        title: 'Erro na sincronização',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sincronização Manual com Stripe
        </CardTitle>
        <CardDescription>
          Sincronize manualmente os dados de uma assinatura específica com o Stripe.
          Útil quando webhooks falharam ou dados estão desatualizados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subscription-id">ID da Assinatura (UUID)</Label>
          <div className="flex gap-2">
            <Input
              id="subscription-id"
              placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleSync} disabled={loading || !subscriptionId.trim()}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Você pode encontrar o ID da assinatura na tabela de gerenciamento de assinaturas
          </p>
        </div>

        {result && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="space-y-1">
                <p className="font-semibold">Sincronização bem-sucedida!</p>
                <p className="text-sm">Status no Stripe: <strong>{result.stripe_status}</strong></p>
                <p className="text-sm">Status mapeado: <strong>{result.mapped_status}</strong></p>
                <p className="text-sm">
                  Período atual termina em:{' '}
                  <strong>{new Date(result.current_period_end).toLocaleDateString('pt-BR')}</strong>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">Erro ao sincronizar:</p>
              <p className="text-sm">{error}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Quando usar esta ferramenta?</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Quando webhooks do Stripe falharam</li>
            <li>Para verificar o status real no Stripe</li>
            <li>Após mudanças manuais no Stripe Dashboard</li>
            <li>Para resolver discrepâncias entre Stripe e banco de dados</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
