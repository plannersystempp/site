import React from 'react';
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
    >
      <div className="space-y-24 mb-20">
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Target}
            title="Previsto x Realizado"
            description="Compare em tempo real o orçamento inicial com os gastos efetivados."
          />
          <FeatureCard 
            icon={AlertTriangle}
            title="Alertas de Desvio"
            description="Receba avisos imediatos quando uma categoria de custo ultrapassar o limite definido."
          />
          <FeatureCard 
            icon={PieChart}
            title="Breakdown de Custos"
            description="Análise detalhada de custos por departamento, fornecedor ou tipo de despesa."
          />
        </div>

        {/* Benefit 1 */}
        <BenefitSection
          title="Previsibilidade Financeira"
          description="Não espere o evento acabar para saber quanto custou. Tenha estimativas precisas baseadas na alocação de equipe e recursos em tempo real, permitindo correções de rota imediatas."
          benefits={[
            "Dashboard financeiro em tempo real",
            "Custo por departamento/divisão (Técnica, Artística, Logística)",
            "Projeção de fluxo de caixa do evento",
            "Análise de margem de lucro por projeto antes do fechamento"
          ]}
          imageSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
          imageAlt="Gráficos Financeiros"
        />

        {/* Benefit 2 */}
        <BenefitSection
          title="Precificação Inteligente"
          description="Utilize dados históricos para orçar novos eventos com mais segurança e competitividade. Saiba exatamente qual é o custo da sua operação para definir seu markup."
          reverse={true}
          benefits={[
            "Base de dados histórica de custos",
            "Simulador de cenários e margens",
            "Relatórios de rentabilidade por cliente",
            "Sugestão de otimização de recursos"
          ]}
        />

        {/* CTA */}
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Maximize seus lucros</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Tenha o controle financeiro total dos seus eventos e pare de perder dinheiro com custos invisíveis.
          </p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-900/20">
            Começar Controle
          </button>
        </div>

      </div>
    </SolutionLayout>
  );
};

export default CostEstimation;
