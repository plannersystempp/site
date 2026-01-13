import React from 'react';
import { DollarSign, FileText, Calculator, CreditCard, Receipt } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';

const Payroll: React.FC = () => {
  return (
    <SolutionLayout
      title="Folha de Pagamento"
      description="Cálculo automático de pagamentos baseados em cachês diários, horas extras e reembolsos."
      icon={DollarSign}
      gradient="from-emerald-500 to-green-600"
    >
      <div className="space-y-24 mb-20">
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Calculator}
            title="Cálculo Automático"
            description="O sistema processa horas, diárias e descontos para gerar o valor líquido final."
          />
          <FeatureCard 
            icon={Receipt}
            title="Holerites Digitais"
            description="Geração e envio automático de comprovantes de pagamento para todos os profissionais."
          />
          <FeatureCard 
            icon={CreditCard}
            title="Lote de Pagamentos"
            description="Gere arquivos CNAB para pagamento em lote no seu banco de preferência."
          />
        </div>

        {/* Benefit 1 */}
        <BenefitSection
          title="Fechamento financeiro sem erros"
          description="Automatize o processo de fechamento de folha. O sistema consolida horas, cachês e despesas para gerar o valor exato a ser pago, eliminando erros manuais e recálculos."
          benefits={[
            "Consolidação automática de valores de múltiplos eventos",
            "Gestão de reembolsos e despesas extras aprovadas",
            "Cálculo de impostos e retenções na fonte",
            "Histórico completo de pagamentos por evento e profissional"
          ]}
          imageSrc="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2026"
          imageAlt="Gestão Financeira e Pagamentos"
        />

        {/* Benefit 2 */}
        <BenefitSection
          title="Agilidade no Pagamento"
          description="Transforme dias de trabalho operacional em minutos. Com a aprovação em lote e integração bancária, sua equipe recebe mais rápido e você perde menos tempo."
          reverse={true}
          benefits={[
            "Geração de arquivos de remessa bancária (CNAB)",
            "Integração com principais bancos e fintechs",
            "Notificação de pagamento realizado via WhatsApp/Email",
            "Conciliação bancária automática"
          ]}
        />

        {/* CTA */}
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Simplifique seu financeiro</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Garanta pagamentos pontuais e corretos, melhorando a relação com seus prestadores de serviço.
          </p>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-emerald-900/20">
            Ver Planos
          </button>
        </div>

      </div>
    </SolutionLayout>
  );
};

export default Payroll;
