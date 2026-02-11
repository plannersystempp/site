"use client";

import React from 'react';
import Image from 'next/image';
import { Star, Folder, History } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';

const PersonnelControl: React.FC = () => {
  return (
    <SolutionLayout
      title="Controle de Pessoal"
      description="Cadastre funcionários fixo e freelancers, defina funções e gerencie alocações por divisão de forma eficiente."
      customHero={(onCtaClick) => (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Controle de Pessoal
            </h1>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed max-w-lg">
              Cadastre funcionários fixo e freelancers, defina funções e gerencie alocações por divisão de forma eficiente.
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
               src="/images/gestaodepessoas.png"
               alt="Dashboard de Controle de Pessoal"
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
        
        <div className="grid md:grid-cols-3 gap-8 -mt-16 relative z-10">
          <FeatureCard 
            icon={Folder}
            title="Banco de Talentos"
            description="Mantenha um registro completo de todos os profissionais, suas habilidades e histórico."
          />
          <FeatureCard 
            icon={History}
            title="Histórico de Trabalhos"
            description="Tenha o histórico completo de eventos realizados com uma pessoa. Todos os valores já pagos e em aberto por pessoa."
          />
          <FeatureCard 
            icon={Star}
            title="Avaliação de Performance"
            description="Sistema de rating pós-evento para garantir sempre as melhores equipes."
          />
        </div>

        <BenefitSection
          title="Alocação Inteligente"
          description="Evite conflitos de agenda e garanta que os melhores profissionais estejam nos projetos certos. O sistema alerta sobre indisponibilidades e choques de horário."
          reverse={true}
          imageSrc="/images/AlocacaoPessoal.png"
          imageAlt="Planejamento e Alocação"
          benefits={[
            "Facilidade na alocação por função",
            "Separação de alocações dentro de um evento por áreas",
            "Lançamento de horas extras e faltas",
            "Adicione custos com fornecedores dentro do evento"
          ]}
        />

        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Monte o time dos sonhos</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Tenha total controle sobre quem trabalha nos seus eventos e garanta a qualidade da entrega.
          </p>
          <a 
            href="https://wa.me/5521965865470?text=Quero%20gerenciar%20minha%20equipe%20com%20o%20PlannerSystem" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-purple-900/20"
          >
            Gerenciar Equipe
          </a>
        </div>

      </div>
    </SolutionLayout>
  );
};

export default PersonnelControl;
