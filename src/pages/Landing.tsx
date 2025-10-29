import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/icons/sige-logo.svg" 
              alt="SIGE Logo" 
              className="h-8 sm:h-10 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>
          <div className="flex gap-2 sm:gap-3">
            <Link to="/plans" className="hidden sm:inline-block">
              <Button variant="outline" size="sm" className="sm:px-4">
                Ver Planos
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="sm:px-4">
                <LogIn className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Features Grid */}
      <Features />

      {/* Benefits Section */}
      <section className="bg-card/30 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                Benefícios
              </Badge>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                Por que escolher o SIGE?
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Badge variant="secondary" className="p-1.5 sm:p-2 mt-0.5">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Economia de Tempo</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Automatize cálculos complexos e reduza até 20 horas de trabalho manual por semana
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <Badge variant="secondary" className="p-1.5 sm:p-2 mt-0.5">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Controle Total</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Tenha visibilidade completa sobre custos, equipe e alocação de recursos em tempo real
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <Badge variant="secondary" className="p-1.5 sm:p-2 mt-0.5">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Precisão nos Cálculos</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Elimine erros humanos com cálculos automáticos e precisos de folha de pagamento
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <Badge variant="secondary" className="p-1.5 sm:p-2 mt-0.5">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Fácil de Usar</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Interface intuitiva que qualquer pessoa pode aprender em minutos
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 sm:p-8">
              <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Como funciona?</h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Badge className="min-w-6 sm:min-w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm">
                    1
                  </Badge>
                  <span className="text-sm sm:text-base">Cadastre seus eventos e datas</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Badge className="min-w-6 sm:min-w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm">
                    2
                  </Badge>
                  <span className="text-sm sm:text-base">Adicione sua equipe e funções</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Badge className="min-w-6 sm:min-w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm">
                    3
                  </Badge>
                  <span className="text-sm sm:text-base">Aloque pessoas por divisões</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Badge className="min-w-6 sm:min-w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm">
                    4
                  </Badge>
                  <span className="text-sm sm:text-base">Lance horas trabalhadas diariamente</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Badge className="min-w-6 sm:min-w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm">
                    5
                  </Badge>
                  <span className="text-sm sm:text-base">Gere relatórios de pagamento automáticos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-12 sm:py-16 lg:py-20">
        <div className="container relative mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <Badge variant="default" className="mb-4 sm:mb-6">
              Comece Agora
            </Badge>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Pronto para transformar sua gestão de eventos?
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Junte-se a centenas de empresas que já economizam tempo e dinheiro com o SIGE.
              <span className="block mt-2 font-medium text-foreground">
                Comece grátis hoje, sem compromisso!
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                  Começar Grátis Agora 🚀
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/plans" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6">
                  Ver Todos os Planos
                </Button>
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
              <span className="font-semibold text-foreground">15 dias grátis</span> • Sem cartão de crédito • Suporte em português
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/icons/sige-logo.svg" 
                alt="SIGE Logo" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              © 2024 SIGE - Sistema de Gestão de Eventos
              <span className="block sm:inline sm:ml-2">
                Desenvolvido para simplificar sua operação
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
