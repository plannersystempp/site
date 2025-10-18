import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

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

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate('/auth', { state: { redirectTo: '/plans', planId } });
      return;
    }
    
    navigate(`/app/upgrade?plan=${planId}`);
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
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Escolha o Plano Ideal para sua Equipe
          </h1>
          <p className="text-xl text-muted-foreground">
            Gerencie eventos, equipes e folha de pagamento com a plataforma SIGE
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans?.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative flex flex-col ${
                plan.is_popular 
                  ? 'border-primary shadow-xl scale-105 z-10' 
                  : 'border-border'
              }`}
            >
              {plan.is_popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Mais Popular
                </Badge>
              )}

              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  {getPlanIcon(plan.name)}
                  {plan.name === 'trial' && (
                    <Badge variant="outline">Grátis</Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                {/* Pricing */}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    R$ {plan.price.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    /{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                  </span>
                </div>

                {/* Features */}
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Recursos Inclusos
                    </h4>
                    <ul className="space-y-2">
                      {(plan.features as string[]).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Limits */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {plan.limits.max_team_members === null ? (
                      <span>✓ Membros ilimitados</span>
                    ) : (
                      <span>• Até {plan.limits.max_team_members} membros</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.limits.max_events_per_month === null ? (
                      <span>✓ Eventos ilimitados</span>
                    ) : (
                      <span>• Até {plan.limits.max_events_per_month} eventos/mês</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.limits.max_personnel === null ? (
                      <span>✓ Pessoal ilimitado</span>
                    ) : (
                      <span>• Até {plan.limits.max_personnel} pessoas</span>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  size="lg"
                  className="w-full"
                  variant={plan.is_popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.name === 'trial' ? 'Começar Trial Grátis' : 'Assinar Agora'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso mudar de plano depois?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                  As mudanças entram em vigor imediatamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funciona o trial gratuito?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  O trial gratuito dura 15 dias e inclui acesso completo a todas as funcionalidades.
                  Não é necessário cartão de crédito para começar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso cancelar a qualquer momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim, sem taxas de cancelamento. Você pode cancelar sua assinatura a qualquer momento
                  e terá acesso até o fim do período pago.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-3xl">Ainda tem dúvidas?</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg">
                Nossa equipe está pronta para ajudar você a escolher o melhor plano
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => window.location.href = 'mailto:contato@sige.com.br'}
              >
                Falar com Vendas
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
