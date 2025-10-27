import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Users, DollarSign, BarChart3, Clock, FileText, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">SIGE</h1>
          <div className="flex gap-2">
            <Link to="/plans">
              <Button variant="outline" size="sm">
                Ver Planos
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gerencie seus eventos com eficiência total
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
            Controle completo de pessoal, custos e folha de pagamento para seus eventos em uma única plataforma
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/plans">
              <Button size="default" className="px-6 py-2">
                Ver Planos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="default" variant="outline" className="px-6 py-2">
                Começar Grátis (Trial 15 Dias)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-center mb-8">Funcionalidades Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3">
              <Calendar className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Gestão de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Crie e gerencie eventos com datas precisas, controle de status e organização completa.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3">
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Controle de Pessoal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cadastre funcionários fixos e freelancers, defina funções e gerencie alocações por divisão.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3">
              <Clock className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Lançamento de Horas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Registre horas trabalhadas com regras claras de HE: limiar diário gera 1 cachê não cumulativo.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3">
              <DollarSign className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Folha de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Calcule automaticamente pagamentos baseados em cachês diários e horas extras trabalhadas.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3">
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Estimativa de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visualize custos estimados por evento e acompanhe o orçamento em tempo real.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3">
              <FileText className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Relatórios Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gere relatórios completos de pagamentos com filtros por período e profissional.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Por que escolher nosso sistema?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="p-1.5 mt-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm">Economia de Tempo</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatize cálculos complexos e reduza horas de trabalho manual
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="p-1.5 mt-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm">Controle Total</h4>
                    <p className="text-sm text-muted-foreground">
                      Tenha visibilidade completa sobre custos e alocação de recursos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="p-1.5 mt-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm">Precisão nos Cálculos</h4>
                    <p className="text-sm text-muted-foreground">
                      Elimine erros humanos com cálculos automáticos e precisos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="p-1.5 mt-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm">Fácil de Usar</h4>
                    <p className="text-sm text-muted-foreground">
                      Interface intuitiva que qualquer pessoa pode aprender rapidamente
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-3">Como funciona?</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">1</Badge>
                  <span className="text-sm">Cadastre seus eventos e datas</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">2</Badge>
                  <span className="text-sm">Adicione sua equipe e funções</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">3</Badge>
                  <span className="text-sm">Aloque pessoas por divisões</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">4</Badge>
                  <span className="text-sm">Lance horas trabalhadas diariamente</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">5</Badge>
                  <span className="text-sm">Gere relatórios de pagamento</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-xl mx-auto">
          <h3 className="text-2xl font-bold mb-3">Pronto para começar?</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-6">
            Transforme a gestão dos seus eventos hoje mesmo e tenha controle total sobre custos e equipe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/plans">
              <Button size="default" className="px-6 py-2">
                Ver Planos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="default" variant="outline" className="px-6 py-2">
                Começar Grátis (Trial 15 Dias)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Sistema de Gestão de Eventos. Desenvolvido para simplificar sua operação.
          </p>
        </div>
      </footer>
    </div>
  );
};