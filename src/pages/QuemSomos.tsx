import React from 'react';
import { company } from '@/config/company';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UsefulLinks } from '@/components/shared/UsefulLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, LogIn, ArrowLeft, ArrowRight, Phone } from 'lucide-react';

export const QuemSomos: React.FC = () => {
  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PlannerSystem',
    legalName: company.legalName,
    logo: '/icons/logo_plannersystem.png',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: company.contact.email,
        telephone: company.contact.whatsapp.number,
        areaServed: 'BR',
        availableLanguage: ['pt-BR']
      }
    ]
  } as const;

  const schemaAboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Quem Somos',
    url: typeof window !== 'undefined' ? window.location.href : '/quem-somos',
    mainEntity: {
      '@type': 'Organization',
      name: 'PlannerSystem',
      legalName: company.legalName
    }
  } as const;
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-x-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
        <div 
          className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px),linear-gradient(hsl(var(--primary))_1px,transparent_1px)] bg-[size:60px_60px] animate-grid"
          style={{ backgroundPosition: '0 0, 0 0' }}
        />
      </div>

      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-chart-purple/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
      
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-30 bg-primary dark:bg-card border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/icons/logo_plannersystem.png"
                alt="PlannerSystem - Sistema de Gestão de Eventos"
                className="h-5 w-auto sm:h-6 md:h-7 object-contain transition-all"
              />
            </Link>
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
      
      {/* Spacer */}
      <div className="h-14 sm:h-16 lg:h-20" />

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 flex items-center justify-between">
            <Badge variant="outline" className="px-3 py-1.5 border-primary/30 text-primary">Sobre nós</Badge>
            <Link to="/">
              <Button variant="ghost" size="sm" className="hover:bg-primary/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Início
              </Button>
            </Link>
          </div>

          <script type="application/ld+json">{JSON.stringify(schemaOrganization)}</script>
          <script type="application/ld+json">{JSON.stringify(schemaAboutPage)}</script>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Construímos tecnologia para simplificar a gestão de eventos
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
                O PlannerSystem é desenvolvido pela <span className="font-semibold text-foreground">{company.legalName}</span>. Nossa missão é eliminar o caos operacional e trazer eficiência real para equipes e finanças de eventos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/plans">
                  <Button className="px-5 py-3 font-semibold shadow-lg hover:shadow-xl">
                    Ver Planos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="px-5 py-3 font-semibold" onClick={() => window.open(company.contact.whatsapp.link, '_blank')}>
                  <Phone className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </div>
            </div>
            <div className="relative w-full">
              <div className="absolute inset-0 -z-10 blur-2xl opacity-30 bg-gradient-to-br from-primary/40 via-chart-blue/40 to-chart-purple/40 rounded-[48px] hidden lg:block" />
              <picture>
                <source srcSet="/images/landing/hero-tablet.webp" type="image/webp" />
                <source srcSet="/images/landing/hero-tablet.png.png" type="image/png" />
                <img
                  src="/images/landing/hero-tablet.png.png"
                  alt="Tecnologia PlannerSystem"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain lg:rounded-2xl lg:shadow-xl"
                />
              </picture>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card className="group hover:scale-[1.01] hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-chart-blue/40 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-bold">Nossa Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground">Ser referência em eficiência operacional no setor de eventos, oferecendo tecnologia acessível e poderosa para qualquer tamanho de operação.</p>
              </CardContent>
            </Card>

            <Card className="group hover:scale-[1.01] hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-primary/40 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-bold">Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground">Proporcionar tecnologia de ponta que simplifica a organização, o controle financeiro e a gestão de pessoal, com transparência e eficiência.</p>
              </CardContent>
            </Card>

            <Card className="group hover:scale-[1.01] hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-chart-purple/40 bg-card/80 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-bold">Nossos Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li><span className="font-semibold text-foreground">Inovação:</span> evolução contínua e soluções práticas.</li>
                  <li><span className="font-semibold text-foreground">Transparência:</span> relações claras e confiáveis.</li>
                  <li><span className="font-semibold text-foreground">Excelência:</span> qualidade em cada detalhe.</li>
                  <li><span className="font-semibold text-foreground">Foco no Cliente:</span> sucesso do cliente como prioridade.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-12 border-primary/30 bg-card/80 backdrop-blur-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Entre em Contato</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Tire dúvidas ou solicite uma demonstração.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="h-12" onClick={() => window.location.href = `mailto:${company.contact.email}`}>{company.contact.email}</Button>
                  <Button className="h-12" onClick={() => window.open(company.contact.whatsapp.link, '_blank')}>{company.contact.whatsapp.formatted}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

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

            <UsefulLinks />

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
