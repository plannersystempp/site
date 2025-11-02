import { useStripePaymentInfo } from '@/hooks/useStripePaymentInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StripePaymentInfoProps {
  subscriptionId: string;
}

export function StripePaymentInfo({ subscriptionId }: StripePaymentInfoProps) {
  const { data, isLoading, error } = useStripePaymentInfo({ subscriptionId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Erro ao carregar informações de pagamento: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.hasStripeData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center py-4">
            {data?.message || 'Esta assinatura não possui dados de pagamento no Stripe'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Ativa" },
      trialing: { variant: "secondary", label: "Trial" },
      past_due: { variant: "destructive", label: "Pagamento Atrasado" },
      canceled: { variant: "outline", label: "Cancelada" },
      unpaid: { variant: "destructive", label: "Não Paga" },
    };

    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Status da Assinatura */}
      {data.subscription && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Status no Stripe
              {data.stripeSubscriptionUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => window.open(data.stripeSubscriptionUrl, '_blank')}
                >
                  Ver no Stripe
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              {getStatusBadge(data.subscription.status)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Período atual:</span>
              <span>
                {format(new Date(data.subscription.current_period_start * 1000), 'dd/MM/yyyy', { locale: ptBR })}
                {' → '}
                {format(new Date(data.subscription.current_period_end * 1000), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
            {data.subscription.cancel_at_period_end && (
              <div className="mt-2 p-2 bg-warning/10 rounded-md">
                <p className="text-xs text-warning">
                  ⚠️ Assinatura será cancelada ao final do período
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Método de Pagamento */}
      {data.paymentMethod && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Método de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.paymentMethod.card && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">
                    {data.paymentMethod.card.brand} •••• {data.paymentMethod.card.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expira em {data.paymentMethod.card.exp_month}/{data.paymentMethod.card.exp_year}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Próxima Cobrança */}
      {data.upcomingInvoice && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Próxima Cobrança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  R$ {(data.upcomingInvoice.amount_due / 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  em {format(new Date(data.upcomingInvoice.period_end * 1000), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimas Faturas */}
      {data.invoices && data.invoices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Últimas Faturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">
                        R$ {(invoice.amount_paid / 100).toFixed(2)}
                      </p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                        {invoice.status === 'paid' ? 'Pago' : invoice.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(invoice.created * 1000), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {invoice.invoice_pdf && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(invoice.invoice_pdf!, '_blank')}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
