import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, BarChart3, Clock, FileText, LucideIcon } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Feature {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  popular?: boolean;
}

const features: Feature[] = [
  {
    icon: Calendar,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBgColor: 'bg-blue-50 dark:bg-blue-950/30',
    title: 'Gestão de Eventos',
    description: 'Planeje e execute eventos com controle de datas, status e divisões organizadas.',
    popular: true,
  },
  {
    icon: Users,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBgColor: 'bg-purple-50 dark:bg-purple-950/30',
    title: 'Controle de Equipe',
    description: 'Gerencie funcionários fixos e freelancers com funções e avaliações integradas.',
    popular: true,
  },
  {
    icon: Clock,
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBgColor: 'bg-orange-50 dark:bg-orange-950/30',
    title: 'Registro de Horas',
    description: 'Lance horas trabalhadas com regras automáticas de hora extra e cachês.',
  },
  {
    icon: DollarSign,
    iconColor: 'text-green-600 dark:text-green-400',
    iconBgColor: 'bg-green-50 dark:bg-green-950/30',
    title: 'Folha de Pagamento',
    description: 'Calcule pagamentos automaticamente com precisão e gere comprovantes.',
    popular: true,
  },
  {
    icon: BarChart3,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    title: 'Controle de Custos',
    description: 'Visualize custos com fornecedores e acompanhe o orçamento em tempo real.',
  },
  {
    icon: FileText,
    iconColor: 'text-pink-600 dark:text-pink-400',
    iconBgColor: 'bg-pink-50 dark:bg-pink-950/30',
    title: 'Relatórios Completos',
    description: 'Gere relatórios detalhados de pagamentos, custos e desempenho da equipe.',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
      <div className="text-center mb-10 sm:mb-12">
        <Badge variant="secondary" className="mb-4">
          Funcionalidades
        </Badge>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
          Tudo que você precisa em um só lugar
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Ferramentas poderosas para otimizar cada etapa da gestão dos seus eventos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="h-full group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        {feature.popular && (
          <div className="absolute top-3 right-3">
            <Badge variant="default" className="text-xs">
              Popular
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${feature.iconBgColor} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.iconColor} group-hover:rotate-3 transition-transform duration-300`} />
          </div>
          <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </CardContent>

        {/* Hover effect gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </div>
  );
};
