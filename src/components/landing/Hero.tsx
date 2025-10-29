import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Check, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedCounter } from './AnimatedCounter';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const Hero: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="container relative mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className={`mb-6 flex flex-wrap justify-center gap-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Shield className="w-3 h-3" />
              <span className="text-xs">Seguro & LGPD</span>
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Check className="w-3 h-3" />
              <span className="text-xs">Suporte BR</span>
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Setup em 5 min</span>
            </Badge>
          </div>

          {/* Headline */}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent leading-tight transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Economize 20 horas por semana na gestão dos seus eventos
          </h1>
          
          {/* Subheadline */}
          <p className={`text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Controle total de equipe, custos e pagamentos em uma única plataforma. 
            <span className="block mt-2 font-medium text-foreground">
              Nunca mais perca tempo com planilhas e cálculos manuais.
            </span>
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                Começar Grátis Agora 🚀
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/plans" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6">
                Ver Planos
              </Button>
            </Link>
          </div>

          {/* Trial Info */}
          <p className={`text-xs sm:text-sm text-muted-foreground mb-10 sm:mb-12 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="font-semibold text-foreground">Trial 15 dias grátis</span> • Sem cartão de crédito • Cancele quando quiser
          </p>

          {/* Stats */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 sm:p-6 hover:scale-105 transition-transform">
              <AnimatedCounter end={500} suffix="+" isVisible={isVisible} />
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Eventos gerenciados</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 sm:p-6 hover:scale-105 transition-transform">
              <AnimatedCounter end={10000} suffix="+" isVisible={isVisible} />
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Horas economizadas</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 sm:p-6 hover:scale-105 transition-transform">
              <AnimatedCounter end={98} suffix="%" isVisible={isVisible} />
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Precisão nos cálculos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};
