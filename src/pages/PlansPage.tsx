import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Star, Crown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { toast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'annually';
  features: string[];
  limits: {
    max_team_members: number | null;
    max_events_per_month: number | null;
    max_personnel: number | null;
  };
  sort_order: number;
  is_popular?: boolean;
}

export default function PlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // SEO: Update document metadata
  useEffect(() => {
    // Update page title
    document.title = 'Planos e Preços - SIGE | Sistema de Gestão de Eventos';
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('description', 'Escolha o plano ideal para sua equipe. Trial gratuito por 15 dias, sem necessidade de cartão de crédito. Gerencie eventos, equipes e folha de pagamento com o SIGE.');
    updateMetaTag('keywords', 'planos sige, preços gestão eventos, trial gratuito, software gestão eventos, plataforma gestão equipes');
    updateMetaTag('og:title', 'Planos e Preços - SIGE', true);
    updateMetaTag('og:description', 'Planos flexíveis para gestão de eventos. Trial gratuito por 15 dias. Escolha entre Básico, Profissional ou Enterprise.', true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', window.location.href, true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Planos e Preços - SIGE');
    updateMetaTag('twitter:description', 'Planos flexíveis para gestão de eventos. Trial gratuito por 15 dias.');

    // Add canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + '/plans');

    // Add structured data for pricing
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Planos de Assinatura SIGE",
      "description": "Planos de assinatura para o Sistema de Gestão de Eventos SIGE",
      "itemListElement": []
    };

    let script = document.querySelector('script[type="application/ld+json"]#plans-schema');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', 'plans-schema');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    // Cleanup function
    return () => {
      document.title = 'SIGE - Sistema de Gestão de Eventos';
      canonical?.remove();
    };
  }, []);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['public-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as unknown as Plan[];
    }
  });

  const getPlanIcon = (planName: string) => {
    if (planName.includes('starter')) return <Zap className="h-8 w-8 text-blue-500" />;
    if (planName.includes('pro')) return <Star className="h-8 w-8 text-purple-500" />;
    if (planName.includes('enterprise')) return <Crown className="h-8 w-8 text-amber-500" />;
    return <Check className="h-8 w-8 text-primary" />;
  };

  const { mutate: createCheckout, isPending: isCreatingCheckout } = useStripeCheckout();

  const handleSelectPlan = async (planId: string, planName: string) => {
    if (!user) {
      navigate('/auth', { state: { redirectTo: '/plans', planId } });
      return;
    }

    // Buscar team_id do usuário
    const { data: membership, error } = await supabase
      .from('team_members')
      .select('team_id, role, status, teams(name)')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .eq('role', 'admin')
      .maybeSingle();

    if (error || !membership) {
      toast({
        title: 'Erro',
        description: 'Você precisa ser admin de uma equipe para assinar um plano',
        variant: 'destructive'
      });
      return;
    }

    // Se for trial, redirecionar para a antiga lógica
    if (planName === 'trial') {
      navigate(`/app/upgrade?plan=${planId}`);
      return;
    }

    // Confirmar com usuário
    if (!window.confirm(
      `Você será redirecionado para o checkout do plano "${planName}". Deseja continuar?`
    )) {
      return;
    }

    // Criar checkout session
    createCheckout(
      { 
        planId, 
        teamId: membership.team_id 
      },
      {
        onSuccess: (data) => {
          console.log('Redirecionando para Stripe Checkout...');
          window.location.href = data.url;
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map(i => (
              <Card key={i} className="relative">
                <CardHeader className="space-y-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(j => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section - Mais Compacto */}
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Escolha seu Plano
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Gerencie eventos e equipes com facilidade
          </p>
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-green-500" />
              <span>15 dias grátis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-green-500" />
              <span>Sem cartão</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-green-500" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards - Grid para 4 Planos com altura flexível */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 max-w-7xl mx-auto mb-8 sm:mb-12 items-start">
          {plans?.map((plan, index) => (
            <Card 
              key={plan.id}
              className={`relative flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group h-fit ${
                plan.is_popular 
                  ? 'border-primary shadow-lg scale-100 xl:scale-105 z-10 bg-gradient-to-br from-primary/5 to-primary/10' 
                  : 'border-border hover:border-primary/50 bg-card/50 backdrop-blur-sm'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-2 py-0.5 text-xs font-semibold shadow-lg">
                    ⭐ Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-2 sm:space-y-3 pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${
                    plan.is_popular 
                      ? 'bg-primary/10 ring-1 ring-primary/20' 
                      : 'bg-muted/50 group-hover:bg-primary/10'
                  } transition-all duration-300`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  {plan.name === 'trial' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      Grátis
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-bold leading-tight">
                    {plan.display_name}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {plan.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 sm:space-y-4 px-3 sm:px-4 lg:px-6">
                {/* Pricing - Compacto */}
                <div className="text-center py-1 sm:py-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  {plan.billing_cycle === 'annually' && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Economize 20%
                    </Badge>
                  )}
                </div>

                {/* Features - Todos os recursos visíveis */}
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      Recursos Inclusos
                    </h4>
                    <ul className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                      {(plan.features as string[]).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 group/item">
                          <div className="p-0.5 rounded-full bg-primary/10 group-hover/item:bg-primary/20 transition-colors mt-0.5 flex-shrink-0">
                            <Check className="h-2 w-2 text-primary" />
                          </div>
                          <span className="text-xs leading-relaxed text-left">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Limits - Compacto */}
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <div className="grid gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary/60"></div>
                      {plan.limits.max_team_members === null ? (
                        <span className="text-green-600 font-medium">Membros ilimitados</span>
                      ) : (
                        <span>Até <strong>{plan.limits.max_team_members}</strong> membros</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary/60"></div>
                      {plan.limits.max_events_per_month === null ? (
                        <span className="text-green-600 font-medium">Eventos ilimitados</span>
                      ) : (
                        <span>Até <strong>{plan.limits.max_events_per_month}</strong> eventos/mês</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 px-3 sm:px-4 lg:px-6">
                <Button
                  size="sm"
                  className={`w-full h-8 sm:h-10 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    plan.is_popular 
                      ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl' 
                      : 'hover:bg-primary/90 hover:shadow-lg'
                  }`}
                  variant={plan.is_popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                  disabled={isCreatingCheckout}
                >
                  {isCreatingCheckout ? (
                    <>
                      <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {plan.name === 'trial' ? (
                        <>
                          <Zap className="mr-1 h-2.5 w-2.5" />
                          Começar Grátis
                        </>
                      ) : (
                        <>
                          <Crown className="mr-1 h-2.5 w-2.5" />
                          Assinar
                        </>
                      )}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust Indicators - Mais Compacto */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Crown className="h-3 w-3 text-blue-600" />
              </div>
              <span>Suporte 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <Star className="h-3 w-3 text-purple-600" />
              </div>
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* FAQ Section - Reduzido para 3 perguntas principais */}
        <div className="mt-12 sm:mt-16 max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8">
            Dúvidas Frequentes
          </h2>
          <div className="grid gap-3 sm:gap-4">
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">?</span>
                  </div>
                  Posso mudar de plano depois?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sim! Você pode fazer upgrade ou downgrade a qualquer momento.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500/20 hover:border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-blue-500 font-bold text-xs">?</span>
                  </div>
                  Como funciona o trial?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  15 dias grátis com acesso completo. Sem cartão de crédito.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500/20 hover:border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500 font-bold text-xs">?</span>
                  </div>
                  Posso cancelar quando quiser?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sim, sem taxas. Acesso até o final do período pago.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section - Mais Compacto */}
          <div className="mt-8 sm:mt-12 text-center">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  Ainda tem dúvidas?
                </CardTitle>
                <CardDescription className="text-sm">
                  Nossa equipe está pronta para ajudar
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-0">
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => window.location.href = 'mailto:suporte@plannersystem.com.br'}
                >
                  <Star className="mr-2 h-3 w-3" />
                  Falar com Vendas
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                  onClick={() => window.open('https://wa.me/5521965232224', '_blank')}
                >
                  <Zap className="mr-2 h-3 w-3" />
                  WhatsApp
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
