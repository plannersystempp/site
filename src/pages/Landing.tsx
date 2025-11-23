import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Users, DollarSign, BarChart3, Clock, FileText, LogIn, Monitor, Smartphone, Tablet, Play, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  const [dashboardPreviewLoaded, setDashboardPreviewLoaded] = useState(false);
  const [dashboardPreviewError, setDashboardPreviewError] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]">
        <div 
          className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px),linear-gradient(hsl(var(--primary))_1px,transparent_1px)] bg-[size:60px_60px] animate-grid"
          style={{ backgroundPosition: '0 0, 0 0' }}
        />
      </div>

      {/* Floating Gradient Orbs - More pronounced */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-chart-purple/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-chart-blue/10 rounded-full blur-3xl animate-pulse delay-500" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-chart-orange/8 rounded-full blur-3xl animate-pulse delay-700" />

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

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Content Column */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                  Sistema Completo de Gestão de Eventos
                </span>
                <br />
                <span className="text-foreground">Eficiência Total em Eventos e Equipes</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Controle completo de pessoal, custos e folha de pagamento para seus eventos em 
                <span className="text-primary font-semibold"> uma única plataforma</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
              <Link to="/plans">
                <Button size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto group touch-manipulation">
                  Ver Planos
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto group touch-manipulation">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Começar Grátis (Trial 15 Dias)
                </Button>
              </Link>
            </div>
          </div>

          {/* System Preview Column removido temporariamente */}
          {/* Conteúdo de preview virá posteriormente quando houver imagem */}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-28">
        <div className="text-center mb-10 sm:mb-14 lg:mb-20">
          <Badge variant="outline" className="mb-4 sm:mb-6 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border-primary/30 text-primary">
            Funcionalidades
          </Badge>
          <h3 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Tudo que você precisa
            </span>
            <br />
            <span className="text-primary">em uma plataforma</span>
          </h3>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Ferramentas completas para gerenciar eventos, equipes e pagamentos com máxima eficiência
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Feature Cards */}
          <div itemScope itemType="https://schema.org/Thing">
            <Card className="group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-primary/40 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-primary/10">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <CardTitle itemProp="name" className="text-lg sm:text-xl font-bold leading-tight">Gestão de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <p itemProp="description" className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Crie e gerencie eventos com datas precisas, controle de status e organização completa para máxima eficiência.
                </p>
              </CardContent>
            </Card>
          </div>

          <div itemScope itemType="https://schema.org/Thing">
            <Card className="group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-chart-purple/40 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-chart-purple/20 to-chart-purple/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-chart-purple/10">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-chart-purple" />
                </div>
                <CardTitle itemProp="name" className="text-lg sm:text-xl font-bold leading-tight">Controle de Pessoal</CardTitle>
              </CardHeader>
              <CardContent>
                <p itemProp="description" className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Cadastre funcionários fixos e freelancers, defina funções e gerencie alocações por divisão com facilidade.
                </p>
              </CardContent>
            </Card>
          </div>

          <div itemScope itemType="https://schema.org/Thing">
            <Card className="group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-chart-orange/40 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-chart-orange/20 to-chart-orange/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-chart-orange/10">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-chart-orange" />
                </div>
                <CardTitle itemProp="name" className="text-lg sm:text-xl font-bold leading-tight">Lançamento de Horas</CardTitle>
              </CardHeader>
              <CardContent>
                <p itemProp="description" className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Registre horas trabalhadas com regras claras de HE: limiar diário gera 1 cachê não cumulativo automaticamente.
                </p>
              </CardContent>
            </Card>
          </div>

          <div itemScope itemType="https://schema.org/Thing">
            <Card className="group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-success/40 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-success/20 to-success/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-success/10">
                  <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-success" />
                </div>
                <CardTitle itemProp="name" className="text-lg sm:text-xl font-bold leading-tight">Folha de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p itemProp="description" className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Calcule automaticamente pagamentos baseados em cachês diários e horas extras com precisão total.
                </p>
              </CardContent>
            </Card>
          </div>

          <div itemScope itemType="https://schema.org/Thing">
            <Card className="group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-chart-blue/40 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-chart-blue/20 to-chart-blue/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-chart-blue/10">
                  <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-chart-blue" />
                </div>
                <CardTitle itemProp="name" className="text-lg sm:text-xl font-bold leading-tight">Estimativa de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <p itemProp="description" className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Visualize custos estimados por evento e acompanhe o orçamento em tempo real com dashboards intuitivos.
                </p>
              </CardContent>
            </Card>
          </div>

          <div itemScope itemType="https://schema.org/Thing">
            <Card className="group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-chart-purple/40 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-chart-purple/20 to-chart-purple/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-chart-purple/10">
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-chart-purple" />
                </div>
                <CardTitle itemProp="name" className="text-lg sm:text-xl font-bold leading-tight">Relatórios Detalhados</CardTitle>
              </CardHeader>
              <CardContent>
                <p itemProp="description" className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Gere relatórios completos de pagamentos com filtros avançados por período e profissional.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative bg-gradient-to-br from-card/40 via-card/30 to-card/20 backdrop-blur-sm py-12 sm:py-16 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
              <Badge variant="outline" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border-primary/30 text-primary">
                Vantagens
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Por que escolher o PlannerSystem?
              </h2>
                <h3 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
                  <span className="text-foreground">Por que escolher</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">nosso sistema?</span>
                </h3>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-primary/10">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-base sm:text-lg font-bold">Economia de Tempo</h4>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      Automatize cálculos complexos e reduza horas de trabalho manual com nossa tecnologia avançada
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-chart-purple/20 to-chart-purple/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-chart-purple/10">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-chart-purple" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-base sm:text-lg font-bold">Controle Total</h4>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      Tenha visibilidade completa sobre custos e alocação de recursos em tempo real
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-chart-blue/20 to-chart-blue/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-chart-blue/10">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-chart-blue" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-base sm:text-lg font-bold">Precisão nos Cálculos</h4>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      Elimine erros humanos com cálculos automáticos e precisos baseados em regras customizáveis
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-success/20 to-success/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-success/10">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="text-base sm:text-lg font-bold">Fácil de Usar</h4>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      Interface intuitiva que qualquer pessoa pode aprender rapidamente, sem necessidade de treinamento
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/15 via-primary/8 to-transparent rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-primary/30 backdrop-blur-md shadow-xl shadow-primary/5">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold">Como funciona?</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Processo simples e intuitivo em 5 passos
                  </p>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-chart-blue rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                      1
                    </div>
                    <span className="text-sm sm:text-base font-medium">Cadastre seus eventos e datas</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-chart-purple to-chart-purple/80 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-chart-purple/20">
                      2
                    </div>
                    <span className="text-sm sm:text-base font-medium">Adicione sua equipe e funções</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-chart-orange to-chart-orange/80 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-chart-orange/20">
                      3
                    </div>
                    <span className="text-sm sm:text-base font-medium">Aloque pessoas por divisões</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-success to-chart-green rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-success/20">
                      4
                    </div>
                    <span className="text-sm sm:text-base font-medium">Lance horas trabalhadas diariamente</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-chart-blue to-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-chart-blue/20">
                      5
                    </div>
                    <span className="text-sm sm:text-base font-medium">Gere relatórios de pagamento</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-28 text-center">
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
          <div className="space-y-4 sm:space-y-6">
            <Badge variant="outline" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border-primary/30 text-primary">
              Comece Agora
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Pronto para transformar seus eventos?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Transforme a gestão dos seus eventos hoje mesmo e tenha controle total sobre custos, equipe e resultados.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center">
            <Link to="/plans">
              <Button size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto group touch-manipulation">
                Ver Planos
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto group touch-manipulation">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 group-hover:scale-110 transition-transform" />
                Começar Grátis (Trial 15 Dias)
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-6 sm:pt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                <span>Suporte incluído</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                <span>Setup gratuito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-md py-8 sm:py-10 lg:py-16 shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Brand Column */}
            <div className="space-y-3 sm:space-y-4">
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
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-base sm:text-lg font-bold">Links Úteis</h4>
              <div className="space-y-2 sm:space-y-3">
                <Link to="/plans" className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Planos e Preços
                </Link>
                <Link to="/auth" className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Fazer Login
                </Link>
                <Link to="/support" className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Suporte
                </Link>
              </div>
            </div>

            {/* Contact Column */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-base sm:text-lg font-bold">Contato</h4>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                <p>suporte@plannersystem.com.br</p>
                <div className="flex items-center gap-2">
                  <span>WhatsApp:</span>
                  <a 
                    href="https://wa.me/5521965865470" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-success hover:text-chart-green transition-colors font-medium"
                  >
                    (21) 96586-5470
                  </a>
                </div>
                <p>Segunda a Sexta, 9h às 18h</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              © 2025 Sistema de Gestão de Eventos. Desenvolvido para simplificar sua operação.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};