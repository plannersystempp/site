import React from 'react';
import { Calendar, CheckCircle, Clock, MapPin, Layout, Users, Sliders } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';

const EventManagement: React.FC = () => {
  return (
    <SolutionLayout
      title="Gestão de Eventos"
      description="Crie e gerencie eventos com datas precisas, controle de status e organização completa. Tenha a visão macro de toda a sua operação."
      icon={Calendar}
      gradient="from-blue-500 to-cyan-500"
    >
      <div className="space-y-24 mb-20">
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Layout}
            title="Dashboard Centralizado"
            description="Visualize todos os seus eventos em uma única tela com indicadores de status em tempo real."
          />
          <FeatureCard 
            icon={Calendar}
            title="Calendário Inteligente"
            description="Interface drag-and-drop para organizar cronogramas e evitar conflitos de agenda."
          />
          <FeatureCard 
            icon={Sliders}
            title="Status Personalizáveis"
            description="Defina seu próprio fluxo de trabalho: Proposta, Pré-produção, Confirmado, Realizado."
          />
        </div>

        {/* Benefit 1 */}
        <BenefitSection
          title="Controle total do cronograma"
          description="Chega de planilhas descentralizadas. Com o PlannerSystem, você centraliza todas as datas, horários e locais dos seus eventos em um único dashboard intuitivo."
          benefits={[
            "Visualização de calendário mensal, semanal e diária",
            "Gestão de múltiplos locais e palcos simultâneos",
            "Timeline detalhada de produção minuto a minuto",
            "Notificações automáticas de prazos"
          ]}
          imageSrc="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2068"
          imageAlt="Dashboard de Eventos"
        />

        {/* Benefit 2 */}
        <BenefitSection
          title="Gestão de Múltiplos Locais"
          description="Coordene operações complexas em diferentes cidades ou venues. O sistema permite segmentar a visão por local, garantindo que cada coordenador veja apenas o que importa."
          reverse={true}
          benefits={[
            "Filtros avançados por região e tipo de evento",
            "Atribuição de equipes específicas por localidade",
            "Controle de logística e deslocamento integrado",
            "Mapas interativos de venues"
          ]}
        />

        {/* CTA */}
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Pronto para organizar seus eventos?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de produtores que já simplificaram sua gestão com o PlannerSystem.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/20">
            Começar Agora
          </button>
        </div>

      </div>
    </SolutionLayout>
  );
};

export default EventManagement;
