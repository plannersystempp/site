import React from 'react';
import { Calendar, CheckCircle, Clock, MapPin, Layout, Users, Sliders } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';
import useUIStore from '../../store/ui';

const EventManagement: React.FC = () => {
  const { openPlansModal, openContactModal } = useUIStore();

  return (
    <>
    <SolutionLayout
      title="Gestão de Eventos"
      description="Crie e gerencie eventos com datas precisas, controle de status e organização completa. Tenha a visão macro de toda a sua operação."
      customHero={() => (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Gestão de Eventos
            </h1>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed max-w-lg">
              Crie e gerencie eventos com datas precisas, controle de status e organização completa. Tenha a visão macro de toda a sua operação.
            </p>
            <button 
              onClick={openContactModal}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
            >
              Começar Agora
            </button>
          </div>
          <div>
            <img 
               src="/images/gestaodeeventos.png"
               alt="Dashboard de Gestão de Eventos"
               className="w-full h-auto object-contain"
             />
          </div>
        </div>
      )}
    >
      <div className="space-y-24 mb-20">
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 -mt-16 relative z-10">
          <FeatureCard 
            icon={Layout}
            title="Dashboard Centralizado"
            description="Visualize todos os seus eventos em uma única tela com indicadores de status em tempo real."
          />
          <FeatureCard 
            icon={Calendar}
            title="Gestão de Eventos"
            description="Controle múltiplos eventos de forma simultaneamente com total organização."
          />
          <FeatureCard 
            icon={Sliders}
            title="Status Personalizáveis"
            description="Defina eventos como: Planejado, Em andamento, Concluído e Cancelado"
          />
        </div>

        {/* Benefit 1 */}
        <BenefitSection
          title="Controle total do cronograma"
          description="Chega de planilhas descentralizadas. Com o PlannerSystem, você centraliza todas as datas, horários e locais dos seus eventos em um único dashboard intuitivo."
          benefits={[
            "Visualização centralizada de todos os eventos",
            "Gestão de múltiplos locais e palcos simultâneos",
            "Insira anotações e detalhes dos seus eventos"
          ]}
          imageSrc="/images/GestaodeeventosDashboard.jpeg"
          imageAlt="Dashboard de gestão de eventos do PlannerSystem"
          cleanImage
        />

        {/* CTA */}
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Pronto para organizar seus eventos?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a empresas que já simplificaram sua gestão com o PlannerSystem.
          </p>
          <button 
            onClick={openPlansModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            Ver Planos
          </button>
        </div>

      </div>
    </SolutionLayout>
    </>
  );
};

export default EventManagement;
