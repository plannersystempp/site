import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Star,
  Users,
  Calendar,
  DollarSign,
  Phone,
  LogIn,
  Play
} from 'lucide-react';
import { useABVariant } from '@/hooks/marketing/useABVariant';
import { useToast } from '@/hooks/use-toast';
import { company } from '@/config/company';
import { Link } from 'react-router-dom';

// Componente para o Pixel do Google Ads
const GoogleAdsPixel = () => {
  useEffect(() => {
    // Exemplo de implementação do Pixel
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX";
    document.head.appendChild(script);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-XXXXXXXXX');
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(script2);
    };
  }, []);

  return null;
};

// Componente Schema Markup
const SchemaMarkup = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PlannerSystem",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL",
      "description": "Teste grátis por 30 dias"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "150"
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export const SalesLanding = () => {
  const variant = useABVariant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de envio e tracking de conversão
    try {
      // Aqui entraria a chamada real para API
      console.log('Lead capturado:', formData);
      
      // Disparar evento de conversão do Google Ads
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-XXXXXXXXX/YYYYYYYYYY'
        });
      }

      toast({
        title: "Sucesso!",
        description: "Em breve entraremos em contato para liberar seu acesso.",
      });
      
      setFormData({ name: '', email: '', phone: '' });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Houve um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-x-hidden font-sans">
      <GoogleAdsPixel />
      <SchemaMarkup />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
        <div 
          className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px),linear-gradient(hsl(var(--primary))_1px,transparent_1px)] bg-[size:60px_60px] animate-grid"
          style={{ backgroundPosition: '0 0, 0 0' }}
        />
      </div>

      {/* Floating Gradient Orbs - More pronounced */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-chart-purple/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-chart-blue/10 rounded-full blur-3xl animate-pulse delay-500 pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-chart-orange/8 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-30 bg-primary dark:bg-card border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/icons/logo_plannersystem.png"
              alt="PlannerSystem - Sistema de Gestão de Eventos"
              className="h-5 w-auto sm:h-6 md:h-7 object-contain transition-all"
            />
          </div>
          <div className="flex gap-2 sm:gap-3 lg:gap-4">
            <Link to="/plans">
              <Button variant="outline" size="sm" className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-2 transition-all duration-300 touch-manipulation 
                bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary 
                dark:bg-transparent dark:text-muted-foreground dark:border-input dark:hover:bg-accent dark:hover:text-accent-foreground">
                Ver Planos
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="secondary" size="sm" className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 touch-manipulation">
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" aria-hidden="true" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {/* Spacer para compensar a altura do header fixo e evitar sobreposição */}
      <div className="h-14 sm:h-16 lg:h-20" />

      {/* 1. Seção Hero */}
      <section className="relative pt-10 pb-16 md:pt-12 md:pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <Badge variant="outline" className="px-4 py-1 text-sm border-primary/30 text-primary bg-primary/5">
                {variant === 'A' ? 'Oferta por Tempo Limitado' : 'Exclusivo para Gestores de Eventos'}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                {variant === 'A' ? (
                  <>
                    Pare de Perder Dinheiro na <span className="text-primary">Organização de Eventos</span>
                  </>
                ) : (
                  <>
                    A Revolução na Gestão da Sua <span className="text-primary">Equipe de Eventos</span>
                  </>
                )}
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Elimine planilhas, erros de pagamento e caos operacional. Centralize escalas, custos e gestão em uma única plataforma inteligente.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Setup Gratuito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Sem Cartão de Crédito</span>
                </div>
              </div>
            </div>

            {/* Formulário de Captação */}
            <div className="w-full max-w-md mx-auto lg:ml-auto">
              <Card className="border-primary/20 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">Garanta sua Vaga</CardTitle>
                  <p className="text-sm text-muted-foreground">Preencha para desbloquear a oferta especial</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Input 
                        placeholder="Seu Nome Completo" 
                        required 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="h-12 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input 
                        type="email" 
                        placeholder="Seu Melhor E-mail" 
                        required 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="h-12 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input 
                        type="tel" 
                        placeholder="WhatsApp com DDD" 
                        required 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="h-12 bg-background/50"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 animate-pulse hover:animate-none transition-all" disabled={loading}>
                      {loading ? 'Processando...' : 'QUERO AUMENTAR MEUS LUCROS'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1 mt-2">
                      <ShieldCheck className="w-3 h-3" /> Seus dados estão 100% seguros
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Seção de Dores e Soluções */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que continuar sofrendo com a gestão manual?</h2>
            <p className="text-lg text-muted-foreground">Identificamos os maiores gargalos das produtoras de eventos e criamos a solução definitiva.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-none shadow-lg hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">O Caos das Planilhas</h3>
                <p className="text-muted-foreground text-sm">
                  Várias versões de arquivos, dados perdidos e falta de histórico confiável.
                </p>
                <div className="pt-4 border-t border-border/50">
                  <p className="font-semibold text-primary flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Dados Centralizados e Seguros
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-lg hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto text-orange-600 dark:text-orange-400">
                  <DollarSign className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Erros na Folha</h3>
                <p className="text-muted-foreground text-sm">
                  Pagamentos duplicados, esquecidos ou com valores incorretos que geram prejuízo.
                </p>
                <div className="pt-4 border-t border-border/50">
                  <p className="font-semibold text-primary flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Cálculo Automático e Preciso
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-lg hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Tempo Perdido</h3>
                <p className="text-muted-foreground text-sm">
                  Horas gastas montando escalas manualmente e contatando equipe um por um.
                </p>
                <div className="pt-4 border-t border-border/50">
                  <p className="font-semibold text-primary flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Gestão Ágil de Escalas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Caso de Sucesso LAFTECH */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-primary/5 rounded-3xl p-8 md:p-12 lg:p-16 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  "Reduzimos nosso tempo de fechamento em 40% já no primeiro mês."
                </h2>
                <p className="text-lg text-muted-foreground italic">
                  "Antes do PlannerSystem, nossa gestão financeira era um pesadelo de planilhas desconexas. Hoje temos controle total sobre custos de eventos e pagamentos de freelancers. A eficiência operacional da LAFTECH atingiu outro nível."
                </p>
                <div>
                  <h4 className="font-bold text-lg">Carlos Eduardo</h4>
                  <p className="text-muted-foreground">Diretor de Operações, LAFTECH</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-video bg-muted rounded-xl overflow-hidden shadow-2xl border border-border flex items-center justify-center group cursor-pointer relative">
                   {/* Placeholder para vídeo/imagem */}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-all">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-primary border-b-[10px] border-b-transparent ml-1"></div>
                      </div>
                   </div>
                   <img src="/images/landing/hero-tablet.png.png" alt="Case Laftech" className="w-full h-full object-cover" />
                </div>
                
                {/* Métricas Flutuantes */}
                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-lg shadow-xl border border-border animate-bounce-slow hidden md:block">
                  <p className="text-sm text-muted-foreground">Eficiência</p>
                  <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-5 h-5" /> +40%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Oferta Especial */}
      <section className="py-20 bg-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-6 bg-white/20 hover:bg-white/30 text-white border-none px-4 py-2 text-base">
            Oferta Exclusiva Google Ads
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Comece Agora com Condições Especiais</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-12">
            Apenas para os primeiros 50 cadastros desta campanha. Garanta sua tecnologia de ponta com o melhor custo-benefício do mercado.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="font-bold text-xl mb-2">Setup Gratuito</h3>
              <p className="text-blue-100">Economize R$ 997,00 na implementação inicial</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="font-bold text-xl mb-2">30 Dias Grátis</h3>
              <p className="text-blue-100">Teste todas as funcionalidades sem compromisso</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="font-bold text-xl mb-2">Suporte VIP</h3>
              <p className="text-blue-100">Atendimento prioritário via WhatsApp</p>
            </div>
          </div>

          <div className="inline-block bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20 mb-8">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 animate-pulse" />
              Oferta expira em breve: <span className="font-mono font-bold">04:59:32</span>
            </span>
          </div>
        </div>
      </section>

      {/* 5. Call-to-Action Final */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Pronto para transformar sua gestão?</h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              QUERO MINHA VAGA AGORA
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-14 text-lg"
              onClick={() => window.open(company.contact.whatsapp.link, '_blank')}
            >
              <Phone className="mr-2 w-5 h-5" />
              Falar no WhatsApp
            </Button>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
              {/* Selos de segurança fictícios/genéricos */}
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-sm font-medium">SSL Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                <span className="text-sm font-medium">Garantia de 7 Dias</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-md py-12 sm:py-10 lg:py-16 shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Brand Column */}
            <div className="space-y-4 sm:space-y-4">
              <div className="flex items-center">
                <img
                  src="/icons/logo_plannersystem.png"
                  alt="PlannerSystem"
                  className="h-7 w-auto sm:h-8 object-contain"
                />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm">
                Sistema completo para gestão de eventos, equipes e pagamentos. Simplifique sua operação.
              </p>
            </div>

            {/* Links Column */}
            <div className="space-y-4 sm:space-y-4">
              <h4 className="text-base sm:text-lg font-bold">Links Úteis</h4>
              <div className="space-y-3 sm:space-y-3">
                <Link to="/plans" className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Planos e Preços
                </Link>
                <Link to="/quem-somos" className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Quem Somos
                </Link>
                <Link to="/auth" className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Fazer Login
                </Link>
              </div>
            </div>

            {/* Contact Column */}
            <div className="space-y-4 sm:space-y-4 text-center md:text-left">
              <h4 className="text-base sm:text-lg font-bold">Contato</h4>
              <div className="space-y-3 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                <p>{company.contact.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span>WhatsApp:</span>
                  <a 
                    href={company.contact.whatsapp.link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-success hover:text-chart-green transition-colors font-medium"
                  >
                    {company.contact.whatsapp.formatted}
                  </a>
                </div>
                <p>Segunda a Sexta, 9h às 18h</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              © {new Date().getFullYear()} PlannerSystem. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SalesLanding;
