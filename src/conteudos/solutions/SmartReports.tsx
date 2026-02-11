"use client";

import React from 'react';
import Image from 'next/image';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';

const SmartReports: React.FC = () => {
  return (
    <SolutionLayout
      title="Relatórios Inteligentes"
      description="Tenha previsões claras de pagamentos por semana, controle de extras e consolidação automática de eventos em relatórios profissionais."
      icon={FileText}
      gradient="from-slate-700 to-slate-900"
      customHero={(onCtaClick) => (
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-tight">
              Relatórios Inteligentes
            </h1>
            <p className="text-xl text-slate-500 mb-6 leading-relaxed max-w-lg">
              Visualize o fluxo semanal de pagamentos, custos avulsos e previsões consolidadas para cada evento em poucos cliques.
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
              src="/images/relatorios.png"
              alt="Dashboard de Relatórios Inteligentes"
              width={800}
              height={600}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      )}
    >
      <div className="space-y-24 mb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Calendar}
            title="Visibilidade de Fluxo Semanal"
            description="Tenha uma visão clara dos compromissos financeiros futuros, com agrupamentos automáticos por semana que facilitam a gestão do caixa e evitam atrasos."
          />
          <FeatureCard
            icon={DollarSign}
            title="Gestão de Pagamentos Avulsos"
            description="Monitore bônus, horas extras e despesas imprevistas de forma isolada, entendendo exatamente como cada custo variável impacta o fechamento da semana."
          />
          <FeatureCard
            icon={FileText}
            title="Consolidação Automática de Eventos"
            description="Elimine o trabalho manual: o sistema consolida automaticamente os valores de cada projeto, local e data de vencimento em um relatório profissional pronto para exportação."
          />
        </div>

        <BenefitSection
          title="Inteligência Financeira e Operacional"
          description="Transforme sua planilha de pagamentos em uma ferramenta estratégica. Visualize o montante total a pagar por período e tome decisões baseadas na realidade financeira dos seus eventos, sem planilhas manuais."
          benefits={[
            "Relatórios de Previsão Dinâmicos: Dados organizados por evento, local e tipo de despesa.",
            "Controle de Extras e Bônus: Visualize pagamentos avulsos detalhados por colaborador para evitar surpresas.",
            "Filtros Personalizados: Escolha quais colunas e períodos quer visualizar para focar no que importa.",
            "Exportação em Segundos: Relatórios gerenciais formatados e prontos para envio ou análise imediata.",
          ]}
          imageSrc="/images/Previsao de pagamentos.jpeg"
          imageAlt="Dashboard de Previsão de Pagamentos"
        />
      </div>
    </SolutionLayout>
  );
};

export default SmartReports;

