import React from 'react';
import { Calendar, CheckCircle, Clock, MapPin } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';

const EventManagement: React.FC = () => {
  return (
    <SolutionLayout
      title="Gestão de Eventos"
      description="Crie e gerencie eventos com datas precisas, controle de status e organização completa. Tenha a visão macro de toda a sua operação."
      icon={Calendar}
      gradient="from-blue-500 to-cyan-500"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Controle total do cronograma</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-6">
            Chega de planilhas descentralizadas. Com o PlannerSystem, você centraliza todas as datas, horários e locais dos seus eventos em um único dashboard intuitivo.
          </p>
          <ul className="space-y-4">
            {[
              "Status de eventos (Proposta, Confirmado, Cancelado)",
              "Visualização de calendário mensal e semanal",
              "Gestão de múltiplos locais e palcos",
              "Timeline detalhada de produção"
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm">
          <div className="space-y-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                   <Calendar size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-slate-800">Festival de Verão</h4>
                   <p className="text-sm text-slate-500">15-20 Dezembro • São Paulo, SP</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">CONFIRMADO</span>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 opacity-75">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                   <Clock size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-slate-800">Convenção Tech 2025</h4>
                   <p className="text-sm text-slate-500">10 Janeiro • Rio de Janeiro, RJ</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">PROPOSTA</span>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 opacity-75">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                   <MapPin size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-slate-800">Show Corporativo</h4>
                   <p className="text-sm text-slate-500">05 Fevereiro • Curitiba, PR</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PRE-PROD</span>
             </div>
          </div>
        </div>
      </div>
    </SolutionLayout>
  );
};

export default EventManagement;
