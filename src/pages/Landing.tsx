import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Users, DollarSign, BarChart3, Clock, FileText, LogIn, Monitor, Smartphone, Tablet, Play, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div 
          className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px),linear-gradient(hsl(var(--primary))_1px,transparent_1px)] bg-[size:50px_50px] animate-grid"
          style={{ backgroundPosition: '0 0, 0 0' }}
        />
      </div>

      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-500" />

      {/* Header */}
      <header className="relative z-10 border-b bg-card/60 dark:bg-card/40 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary tracking-tight">SIGE</h1>
          </div>
          <div className="flex gap-3 lg:gap-4">
            <Link to="/plans">
              <Button variant="outline" size="sm" className="px-4 py-2 text-sm font-medium border-2 hover:bg-primary/5 transition-all duration-300">
                Ver Planos
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="px-4 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300">
                <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Content Column */}
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                  Gerencie seus eventos
                </span>
                <br />
                <span className="text-foreground">com eficiência total</span>
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Controle completo de pessoal, custos e folha de pagamento para seus eventos em 
                <span className="text-primary font-semibold"> uma única plataforma</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <Link to="/plans">
                <Button size="lg" className="px-8 py-4 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto group">
                  Ver Planos
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="px-8 py-4 text-base lg:text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto group">
                  <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Começar Grátis (Trial 15 Dias)
                </Button>
              </Link>
            </div>
          </div>

          {/* System Preview Column */}
          <div className="relative">
            {/* Main Dashboard Preview */}
            <div className="bg-gradient-to-br from-card/90 to-card/70 dark:from-card/70 dark:to-card/50 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-primary/20 shadow-2xl relative overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-muted/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground">
                  app.sige.com.br/dashboard
                </div>
                <div className="w-4 h-4 bg-muted/30 rounded"></div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-4">
                {/* Header Stats */}
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <div className="h-4 bg-primary/30 rounded w-32"></div>
                    <div className="h-3 bg-muted/60 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-primary/20 rounded-lg w-20"></div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 bg-gradient-to-br from-primary/15 to-primary/8 rounded-xl border border-primary/20 p-3 space-y-2">
                    <div className="h-2 bg-primary/40 rounded w-12"></div>
                    <div className="h-3 bg-primary/60 rounded w-8"></div>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-secondary/15 to-secondary/8 rounded-xl border border-secondary/20 p-3 space-y-2">
                    <div className="h-2 bg-secondary/40 rounded w-12"></div>
                    <div className="h-3 bg-secondary/60 rounded w-8"></div>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-accent/15 to-accent/8 rounded-xl border border-accent/20 p-3 space-y-2">
                    <div className="h-2 bg-accent/40 rounded w-12"></div>
                    <div className="h-3 bg-accent/60 rounded w-8"></div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="h-32 bg-muted/20 rounded-xl border border-border/50 p-4">
                  <div className="h-full bg-gradient-to-t from-primary/10 to-transparent rounded-lg relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-t-lg"></div>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="h-3 bg-muted/40 rounded flex-1"></div>
                    <div className="h-3 bg-muted/40 rounded w-16"></div>
                    <div className="h-3 bg-muted/40 rounded w-12"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-3 bg-muted/30 rounded flex-1"></div>
                    <div className="h-3 bg-muted/30 rounded w-16"></div>
                    <div className="h-3 bg-muted/30 rounded w-12"></div>
                  </div>
                </div>
              </div>

              {/* Floating Device Icons */}
              <div className="absolute -top-4 -right-4 bg-primary/15 backdrop-blur-sm rounded-full p-3 border border-primary/30 shadow-lg">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute -bottom-2 -left-2 bg-secondary/15 backdrop-blur-sm rounded-full p-2 border border-secondary/30 shadow-lg">
                <Smartphone className="w-4 h-4 text-secondary" />
              </div>
              <div className="absolute top-1/2 -right-6 bg-accent/15 backdrop-blur-sm rounded-full p-2 border border-accent/30 shadow-lg">
                <Tablet className="w-4 h-4 text-accent" />
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl pointer-events-none"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center mb-16 lg:mb-20">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-primary/30 text-primary">
            Funcionalidades
          </Badge>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Tudo que você precisa
            </span>
            <br />
            <span className="text-primary">em uma plataforma</span>
          </h3>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ferramentas completas para gerenciar eventos, equipes e pagamentos com máxima eficiência
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Feature Cards */}
          <Card className="group hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold leading-tight">Gestão de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                Crie e gerencie eventos com datas precisas, controle de status e organização completa para máxima eficiência.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary/15 to-secondary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-secondary" />
              </div>
              <CardTitle className="text-xl font-bold leading-tight">Controle de Pessoal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                Cadastre funcionários fixos e freelancers, defina funções e gerencie alocações por divisão com facilidade.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-accent/15 to-accent/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="text-xl font-bold leading-tight">Lançamento de Horas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                Registre horas trabalhadas com regras claras de HE: limiar diário gera 1 cachê não cumulativo automaticamente.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500/15 to-green-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-7 h-7 text-green-600" />
              </div>
              <CardTitle className="text-xl font-bold leading-tight">Folha de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                Calcule automaticamente pagamentos baseados em cachês diários e horas extras com precisão total.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/15 to-blue-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-7 h-7 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold leading-tight">Estimativa de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                Visualize custos estimados por evento e acompanhe o orçamento em tempo real com dashboards intuitivos.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/15 to-purple-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-7 h-7 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-bold leading-tight">Relatórios Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                Gere relatórios completos de pagamentos com filtros avançados por período e profissional.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative bg-gradient-to-br from-card/40 via-card/30 to-card/20 backdrop-blur-sm py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/30 text-primary">
                  Vantagens
                </Badge>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="text-foreground">Por que escolher</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">nosso sistema?</span>
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Economia de Tempo</h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Automatize cálculos complexos e reduza horas de trabalho manual com nossa tecnologia avançada
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/15 to-secondary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Controle Total</h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Tenha visibilidade completa sobre custos e alocação de recursos em tempo real
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/15 to-accent/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-5 h-5 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Precisão nos Cálculos</h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Elimine erros humanos com cálculos automáticos e precisos baseados em regras customizáveis
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/15 to-green-500/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Fácil de Usar</h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Interface intuitiva que qualquer pessoa pode aprender rapidamente, sem necessidade de treinamento
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 lg:p-10 border border-primary/20 backdrop-blur-sm">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold">Como funciona?</h4>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Processo simples e intuitivo em 5 passos
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                      1
                    </div>
                    <span className="text-base font-medium">Cadastre seus eventos e datas</span>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                      2
                    </div>
                    <span className="text-base font-medium">Adicione sua equipe e funções</span>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                      3
                    </div>
                    <span className="text-base font-medium">Aloque pessoas por divisões</span>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                      4
                    </div>
                    <span className="text-base font-medium">Lance horas trabalhadas diariamente</span>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                      5
                    </div>
                    <span className="text-base font-medium">Gere relatórios de pagamento</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-6">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/30 text-primary">
              Comece Agora
            </Badge>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              <span className="text-foreground">Pronto para</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">transformar seus eventos?</span>
            </h3>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transforme a gestão dos seus eventos hoje mesmo e tenha controle total sobre custos, equipe e resultados.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
            <Link to="/plans">
              <Button size="lg" className="px-8 py-4 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto group">
                Ver Planos
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="px-8 py-4 text-base lg:text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto group">
                <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Começar Grátis (Trial 15 Dias)
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Suporte incluído</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Setup gratuito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t bg-gradient-to-br from-card/60 via-card/40 to-card/20 backdrop-blur-sm py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <h1 className="text-2xl font-bold text-primary">SIGE</h1>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                Sistema completo para gestão de eventos, equipes e pagamentos. Simplifique sua operação.
              </p>
            </div>

            {/* Links Column */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold">Links Úteis</h4>
              <div className="space-y-3">
                <Link to="/plans" className="block text-base text-muted-foreground hover:text-primary transition-colors">
                  Planos e Preços
                </Link>
                <Link to="/auth" className="block text-base text-muted-foreground hover:text-primary transition-colors">
                  Fazer Login
                </Link>
                <Link to="/support" className="block text-base text-muted-foreground hover:text-primary transition-colors">
                  Suporte
                </Link>
              </div>
            </div>

            {/* Contact Column */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold">Contato</h4>
              <div className="space-y-3 text-base text-muted-foreground">
                <p>suporte@plannersystem.com.br</p>
                <p>(21) 96523-2224</p>
                <div className="flex items-center gap-2">
                  <span>WhatsApp:</span>
                  <a 
                    href="https://wa.me/5521965232224" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    (21) 96523-2224
                  </a>
                </div>
                <p>Segunda a Sexta, 9h às 18h</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 mt-12 pt-8 text-center">
            <p className="text-base text-muted-foreground">
              © 2025 Sistema de Gestão de Eventos. Desenvolvido para simplificar sua operação.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};