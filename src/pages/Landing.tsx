import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Users, DollarSign, BarChart3, Clock, FileText, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
export const Landing: React.FC = () => {
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">SIGE</h1>
          <Link to="/auth">
            <Button>
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gerencie seus eventos com eficiência total
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Controle completo de pessoal, custos e folha de pagamento para seus eventos em uma única plataforma
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Funcionalidades Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Cards */}
          <Card className="hover:scale-105 transition-transform">
            <CardHeader>
              <Calendar className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Gestão de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Crie e gerencie eventos com datas precisas, controle de status e organizacão completa.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <CardHeader>
              <Users className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Controle de Pessoal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cadastre funcionários fixos e freelancers, defina funções e gerencie alocações por divisão.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <CardHeader>
              <Clock className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Lançamento de Horas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Registre horas trabalhadas com cálculo automático de horas extras acima de 12h por dia.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <CardHeader>
              <DollarSign className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Folha de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Calcule automaticamente pagamentos baseados em cachês diários e horas extras trabalhadas.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Estimativa de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visualize custos estimados por evento e acompanhe o orçamento em tempo real.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <CardHeader>
              <FileText className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Relatórios Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gere relatórios completos de pagamentos com filtros por período e profissional.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card/30 py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Por que escolher nosso sistema?</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Badge variant="secondary" className="p-2">
                    <ArrowRight className="w-4 h-4" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-2">Economia de Tempo</h4>
                    <p className="text-muted-foreground">
                      Automatize cálculos complexos e elimine planilhas manuais
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="secondary" className="p-2">
                    <ArrowRight className="w-4 h-4" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-2">Precisão nos Cálculos</h4>
                    <p className="text-muted-foreground">
                      Evite erros com cálculos automáticos de horas extras e pagamentos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="secondary" className="p-2">
                    <ArrowRight className="w-4 h-4" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-2">Controle Total</h4>
                    <p className="text-muted-foreground">
                      Tenha visibilidade completa de custos e alocações em tempo real
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="secondary" className="p-2">
                    <ArrowRight className="w-4 h-4" />
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-2">Fácil de Usar</h4>
                    <p className="text-muted-foreground">
                      Interface intuitiva que qualquer pessoa pode aprender rapidamente
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8">
              <h4 className="text-xl font-semibold mb-4">Como funciona?</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="min-w-8 h-8 rounded-full flex items-center justify-center">1</Badge>
                  <span>Cadastre seus eventos e datas</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="min-w-8 h-8 rounded-full flex items-center justify-center">2</Badge>
                  <span>Adicione sua equipe e funções</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="min-w-8 h-8 rounded-full flex items-center justify-center">3</Badge>
                  <span>Aloque pessoas por divisões</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="min-w-8 h-8 rounded-full flex items-center justify-center">4</Badge>
                  <span>Lance horas trabalhadas diariamente</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="min-w-8 h-8 rounded-full flex items-center justify-center">5</Badge>
                  <span>Gere relatórios de pagamento</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-6">Pronto para começar?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Transforme a gestão dos seus eventos hoje mesmo e tenha controle total sobre custos e equipe.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            © 2024 Sistema de Gestão de Eventos. Desenvolvido para simplificar sua operação.
          </p>
        </div>
      </footer>
    </div>;
};