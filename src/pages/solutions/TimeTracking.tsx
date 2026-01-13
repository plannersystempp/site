import React from 'react';
import { Clock, CheckCircle, Smartphone, MapPin, Bell } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';
import FeatureCard from '../../components/solutions/FeatureCard';
import BenefitSection from '../../components/solutions/BenefitSection';

const TimeTracking: React.FC = () => {
  return (
    <SolutionLayout
      title="Lançamento de Horas"
      description="Registre horas trabalhadas com regras claras de Horas Extras e geração automática de cachês."
      icon={Clock}
      gradient="from-orange-500 to-amber-500"
    >
      <div className="space-y-24 mb-20">
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Smartphone}
            title="Ponto Mobile"
            description="App intuitivo para que cada profissional registre sua entrada e saída em segundos."
          />
          <FeatureCard 
            icon={MapPin}
            title="Geolocalização"
            description="Garanta que o check-in seja feito apenas no local do evento com cerca virtual."
          />
          <FeatureCard 
            icon={Bell}
            title="Alertas de HE"
            description="Notificações automáticas quando um profissional está prestes a entrar em hora extra."
          />
        </div>

        {/* Benefit 1 */}
        <BenefitSection
          title="Precisão no controle de jornada"
          description="Elimine as dúvidas sobre horas extras e adicionais noturnos. Nosso sistema calcula automaticamente baseado nas regras configuradas para cada evento ou sindicato."
          benefits={[
            "Check-in e Check-out via QR Code ou Geolocalização",
            "Cálculo automático de HE (50%, 100%) e Adicional Noturno",
            "Banco de horas integrado",
            "Fluxo de aprovação de horas por coordenadores"
          ]}
          imageSrc="https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=2069"
          imageAlt="Controle de Horário no Celular"
        />

        {/* Benefit 2 */}
        <BenefitSection
          title="Conformidade e Transparência"
          description="Reduza riscos trabalhistas com registros digitais auditáveis. Tanto a empresa quanto o profissional têm acesso ao espelho de ponto em tempo real."
          reverse={true}
          benefits={[
            "Espelho de ponto digital acessível ao colaborador",
            "Assinatura digital de folha de ponto",
            "Relatórios de inconsistências",
            "Conformidade com a Portaria 671 do MTE"
          ]}
        />

        {/* CTA */}
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Acabe com as planilhas de ponto</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Automatize o controle de jornada e foque no que realmente importa: o sucesso do evento.
          </p>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-orange-900/20">
            Conhecer Solução
          </button>
        </div>

      </div>
    </SolutionLayout>
  );
};

export default TimeTracking;
