"use client";

import React from 'react';
import Image from 'next/image';
import { DollarSign, FileText, Calculator, CreditCard, Receipt } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';

const Payroll: React.FC = () => {
  return (
    <SolutionLayout
      title="Folha de Pagamento"
      description="Cálculo automático de pagamentos com base em cachês, horas extras e descontos."
      icon={DollarSign}
      gradient="from-emerald-500 to-green-600"
      customHero={(onCtaClick) => (
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-tight">
              Folha de Pagamento
            </h1>
            <p className="text-xl text-slate-500 mb-6 leading-relaxed max-w-lg">
              Tenha folha por evento, controle pagamentos parciais e gere relatórios detalhados com cachês, horas extras e descontos.
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
              src="/images/folhadepagamento.png"
              alt="Dashboard de Folha de Pagamento"
              width={800}
              height={600}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      )}
    >
      {({ openPlansModal }) => (
        <div className="space-y-24 mb-20">
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Calculator}
              title="Cálculo Automático"
              description="O sistema processa horas extras, cachês e descontos para gerar o valor líquido final."
            />
            <FeatureCard 
              icon={Receipt}
              title="Pagamentos Parciais"
              description="Registre pagamentos de forma parcial, com a opção de adicionar uma descrição ( ex. adiantamento)."
            />
            <FeatureCard 
              icon={FileText}
              title="Relatórios Detalhados"
              description="Gere relatórios detalhados da folha de pagamento, com cachê, dias trabalhados, quantidade de dias e horas extras."
            />
          </div>

          {/* Benefit 1 */}
          <BenefitSection
            title="Fechamento financeiro sem erros"
            description="Automatize o processo de fechamento de folha. O sistema consolida horas, cachês e despesas para gerar o valor exato a ser pago, eliminando erros manuais e recálculos. Folha individualizada por evento, com todas as pessoas que trabalharam no evento."
            benefits={[
              "Filtre por pagamentos por pendentes ou pagos.",
              "Tenha o controle total de valores pagos, pendentes e percentual concluído."
            ]}
            imageSrc="/images/Folha de pagamento-fixo.jpeg"
            imageAlt="Tela de fechamento de folha de pagamento do PlannerSystem"
          />

          {/* CTA */}
          <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Simplifique seu financeiro</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Garanta pagamentos pontuais e corretos, melhorando a relação com seus prestadores de serviço.
            </p>
            <button 
              onClick={openPlansModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-emerald-900/20"
            >
              Ver Planos
            </button>
          </div>

        </div>
      )}
    </SolutionLayout>
  );
};

export default Payroll;
