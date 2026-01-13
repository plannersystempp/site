import React from 'react';
import { Users, Shield, Star, Briefcase, FileCheck, Search } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';

const PersonnelControl: React.FC = () => {
  return (
    <SolutionLayout
      title="Controle Pessoal"
      description="Cadastre funcionários fixos e freelancers, defina funções e gerencie alocações por divisão de forma eficiente."
      icon={Users}
      gradient="from-purple-600 to-pink-600"
    >
      <div className="space-y-24 mb-20">
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Briefcase}
            title="Banco de Talentos"
            description="Mantenha um registro completo de todos os profissionais, suas habilidades e histórico."
          />
          <FeatureCard 
            icon={FileCheck}
            title="Gestão de Contratos"
            description="Controle vencimentos de contratos, documentação obrigatória e dados bancários."
          />
          <FeatureCard 
            icon={Star}
            title="Avaliação de Performance"
            description="Sistema de rating pós-evento para garantir sempre as melhores equipes."
          />
        </div>

        {/* Benefit 1 */}
        <BenefitSection
          title="Sua equipe organizada"
          description="Mantenha um banco de talentos atualizado e organizado. Saiba exatamente quem está disponível, suas habilidades e histórico de performance antes de escalar."
          benefits={[
            "Cadastro completo (CLT, PJ e Freelancers)",
            "Upload e validação de documentos",
            "Histórico de projetos realizados por profissional",
            "Busca avançada por skills e localização"
          ]}
          imageSrc="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070"
          imageAlt="Equipe trabalhando junta"
        />

        {/* Benefit 2 */}
        <BenefitSection
          title="Alocação Inteligente"
          description="Evite conflitos de agenda e garanta que os melhores profissionais estejam nos projetos certos. O sistema alerta sobre indisponibilidades e choques de horário."
          reverse={true}
          benefits={[
            "Visualização de disponibilidade em tempo real",
            "Alertas de conflito de escala",
            "Sugestão automática de profissionais baseada no perfil",
            "Comunicação direta de escalas via app"
          ]}
        />

        {/* CTA */}
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Monte o time dos sonhos</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Tenha total controle sobre quem trabalha nos seus eventos e garanta a qualidade da entrega.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-purple-900/20">
            Gerenciar Equipe
          </button>
        </div>

      </div>
    </SolutionLayout>
  );
};

export default PersonnelControl;
