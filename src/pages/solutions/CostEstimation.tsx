"use client";

import React from 'react';
import Image from 'next/image';
import { BarChart, TrendingUp, PieChart, AlertTriangle, Target } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';

const CostEstimation: React.FC = () => {
  return (
    <SolutionLayout
      title="Estimativa de Custos"
      description="Visualize custos estimados por evento e acompanhe o orçamento em tempo real para maximizar sua margem."
      icon={BarChart}
      gradient="from-indigo-500 to-purple-600"
      customHero={(onCtaClick) => (
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-tight">
              Estimativa de Custos
            </h1>
            <p className="text-xl text-slate-500 mb-6 leading-relaxed max-w-lg">
              Visualize custos estimados por evento e acompanhe o orçamento em tempo real para maximizar sua margem.
            </p>
            <button 
              onClick={onCtaClick}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
            >
              Começar Agora
            </button>
          </div>
          <div>
            <Image 
              src="/images/custos.png"
              alt="Dashboard de Estimativa de Custos"
              width={800}
              height={600}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      )}
    >
      {({ openContactModal }) => (
        <div className="space-y-24 mb-20">
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BarChart}
              title="Análise e comparação"
              description="Veja custos e compare com outros eventos."
            />
            <FeatureCard 
              icon={PieChart}
              title="Separação de custos de um evento"
              description="Tenha separação entre cachês, horas extras e fornecedores"
            />
            <FeatureCard 
              icon={TrendingUp}
              title="Projeção de Lucratividade"
              description="Projete margens reais baseadas em custos de equipe e fornecedores, ajustando os cenários para garantir a melhor performance financeira do evento."
            />
          </div>

          {/* Benefit 1 */}
          <BenefitSection
            title="Previsibilidade Financeira"
            description="Não espere o fechamento para entender seus custos. Monitore a saúde financeira do seu evento em tempo real, com dados precisos sobre alocação de equipe e recursos."
            benefits={[
              "Visão Analítica por Categoria: Acompanhe a evolução dos custos separando Cachês (Custo Base), Horas Extras e Fornecedores em um único gráfico.",
              "Controle de Horas Extras: Identifique desvios de orçamento no momento em que ocorrem, permitindo correções de rota antes do término do evento.",
              "Dashboard Financeiro Consolidado: Visualize o investimento total de múltiplos projetos (como os 21 eventos do seu período) de forma comparativa e intuitiva.",
              "Análise de Margem e Fluxo: Projeção de fluxo de caixa e margem de lucro por projeto baseada na alocação real de recursos vs. orçado."
            ]}
            imageSrc="/images/analizecustos.jpeg"
            imageAlt="Gráficos Financeiros"
          />

          {/* CTA */}
          <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Maximize seus lucros</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Tenha o controle financeiro total dos seus eventos e pare de perder dinheiro com custos invisíveis.
            </p>
            <button 
              onClick={openContactModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-900/20"
            >
              Começar Controle
            </button>
          </div>

        </div>
      )}
    </SolutionLayout>
  );
};

export default CostEstimation;
