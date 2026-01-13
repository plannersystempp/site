import React from 'react';
import { Clock, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';

const TimeTracking: React.FC = () => {
  return (
    <SolutionLayout
      title="Lançamento de Horas"
      description="Registre horas trabalhadas com regras claras de Horas Extras e geração automática de cachês."
      icon={Clock}
      gradient="from-orange-500 to-amber-500"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Precisão no controle de jornada</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-6">
            Elimine as dúvidas sobre horas extras e adicionais noturnos. Nosso sistema calcula automaticamente baseado nas regras do evento.
          </p>
          <ul className="space-y-4">
            {[
              "Check-in e Check-out via mobile",
              "Cálculo automático de HE (50%, 100%)",
              "Regras de adicional noturno configuráveis",
              "Aprovação de horas por coordenadores"
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-sm mx-auto">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="font-bold text-slate-800">Registro de Ponto</h4>
                 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Em andamento</span>
              </div>
              
              <div className="text-center py-8">
                 <div className="text-5xl font-mono font-bold text-slate-800 mb-2">08:42</div>
                 <p className="text-slate-400 text-sm">Horas trabalhadas hoje</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button className="bg-slate-100 text-slate-400 font-bold py-3 rounded-lg cursor-not-allowed">Entrada</button>
                 <button className="bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors">Saída</button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                 <div className="flex items-center gap-2 text-orange-500 text-xs font-bold">
                    <AlertCircle size={14} />
                    <span>Atenção: Entrando em Hora Extra 50%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </SolutionLayout>
  );
};

export default TimeTracking;
