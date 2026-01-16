"use client";

import React from 'react';
import Image from 'next/image';
import { Target, Heart, Globe } from 'lucide-react';
import SolutionLayout from '../components/SolutionLayout';

const ABOUT_TITLE =
  'O PlannerSystem nasceu para transformar a complexidade da gestão de eventos em clareza estratégica.';
const ABOUT_DESCRIPTION =
  'Somos a plataforma definitiva para conectar sua equipe e centralizar toda a sua operação, eliminando planilhas manuais e a falta de visibilidade financeira.';

const About: React.FC = () => {
  return (
    <SolutionLayout
      title={ABOUT_TITLE}
      description={ABOUT_DESCRIPTION}
      customHero={(onCtaClick) => (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {ABOUT_TITLE}
            </h1>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed max-w-lg">
              {ABOUT_DESCRIPTION}
            </p>
            <button
              onClick={onCtaClick}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
           >
              Falar com especialistas
            </button>
          </div>
          <div>
            <Image
              src="/images/plannersystem_img2.png"
              alt="Operação de eventos utilizando o PlannerSystem em um ambiente real"
              width={800}
              height={600}
              className="w-full h-auto object-cover rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      )}
    >
      <div className="space-y-20">
        {/* Nossa História */}
        <section className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa História</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            O PlannerSystem nasceu da necessidade de simplificar. Em um mundo cada vez mais complexo, 
            percebemos que as ferramentas de gestão estavam se tornando parte do problema, não da solução. 
            Fundada em 2024, nossa missão é fornecer um ecossistema integrado onde produtividade encontra simplicidade.
          </p>
        </section>

        {/* Missão, Visão, Valores */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Missão</h3>
            <p className="text-gray-600">
              Transformar o caos operacional em lucro e controle, fornecendo um ecossistema digital integrado que elimina
              custos invisíveis e centraliza a gestão de staff, financeiro e recursos para o mercado de eventos.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 text-purple-600">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Visão</h3>
            <p className="text-gray-600">
              Ser a plataforma definitiva e indispensável para agências e produtores de eventos que buscam escala,
              tecnologia de ponta e previsibilidade total sobre seus resultados financeiros e operacionais.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-6 text-rose-600">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Valores</h3>
          <p className="text-gray-600">
              Controle e Precisão: Substituímos processos manuais e planilhas por dados exatos, garantindo que o financeiro
              e a operação falem a mesma língua.
            </p>
            <ul className="mt-4 space-y-2 text-gray-600 list-disc pl-5">
              <li>
                Transparência Financeira: Expondo custos ocultos, como horas extras e cachês mal calculados, para proteger a
                margem de lucro de cada projeto.
              </li>
              <li>
                Eficiência Operacional: Conectamos equipes e departamentos em um ambiente intuitivo para aumentar a
                produtividade e eliminar o retrabalho.
              </li>
              <li>
                Segurança na Tomada de Decisão: Oferecemos visibilidade em tempo real para que nossos clientes possam
                corrigir rotas e escalar seus negócios com confiança.
              </li>
              <li>
                Foco no Sucesso do Cliente: Comprometimento com resultados reais, oferecendo suporte dedicado e tecnologia
                que resolve as dores específicas do setor de eventos.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SolutionLayout>
  );
};

export default About;
