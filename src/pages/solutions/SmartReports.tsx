import React from 'react';
import { FileText, Download, Filter, Share2, LayoutDashboard } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';

const SmartReports: React.FC = () => {
  return (
    <SolutionLayout
      title="Relatórios Inteligentes"
      description="Gere relatórios completos de pagamentos, custos e operações com filtros avançados por período e profissional."
      icon={FileText}
      gradient="from-slate-700 to-slate-900"
    >
      <div className="space-y-24 mb-20">
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Filter}
            title="Filtros Avançados"
            description="Cruze dados por evento, período, cliente, profissional ou centro de custo."
          />
          <FeatureCard 
            icon={Download}
            title="Múltiplos Formatos"
            description="Exporte seus dados em PDF, Excel (XLSX) ou CSV para integração com outros sistemas."
          />
          <FeatureCard 
            icon={LayoutDashboard}
            title="Dashboards Visuais"
            description="Gráficos intuitivos que facilitam a leitura e apresentação de resultados para stakeholders."
          />
        </div>

        {/* Benefit 1 */}
        <BenefitSection
          title="Dados para tomada de decisão"
          description="Transforme dados operacionais em insights estratégicos. Elimine o tempo gasto montando apresentações manuais e tenha relatórios profissionais prontos em segundos."
          benefits={[
            "Relatórios gerenciais e operacionais prontos",
            "Personalização de colunas e dados exibidos",
            "Templates de relatórios recorrentes",
            "Envio automático por email"
          ]}
          imageSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2015"
          imageAlt="Análise de Dados em Tablet"
        />

        {/* Benefit 2 */}
        <BenefitSection
          title="Transparência com Clientes"
          description="Gere prestações de contas detalhadas e confiáveis para seus clientes finais. Comprove cada centavo gasto com relatórios auditáveis e organizados."
          reverse={true}
          benefits={[
            "Área do cliente para visualização de relatórios",
            "Links de compartilhamento seguros",
            "Marca d'água e branding personalizado",
            "Anexos de comprovantes digitalizados"
          ]}
        />

        {/* CTA */}
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Inteligência de dados ao seu alcance</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Pare de tomar decisões baseadas em "achismos". Use dados reais para crescer sua empresa.
          </p>
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-slate-900/20">
            Explorar Relatórios
          </button>
        </div>

      </div>
    </SolutionLayout>
  );
};

export default SmartReports;
