import React from 'react';
import { BarChart, CheckCircle, TrendingUp, PieChart } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';

const CostEstimation: React.FC = () => {
  return (
    <SolutionLayout
      title="Estimativa de Custos"
      description="Visualize custos estimados por evento e acompanhe o orçamento em tempo real para maximizar sua margem."
      icon={BarChart}
      gradient="from-indigo-500 to-purple-600"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Previsibilidade Financeira</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-6">
            Não espere o evento acabar para saber quanto custou. Tenha estimativas precisas baseadas na alocação de equipe e recursos em tempo real.
          </p>
          <ul className="space-y-4">
            {[
              "Orçamento Previsto x Realizado",
              "Custo por departamento/divisão",
              "Alertas de estouro de orçamento",
              "Análise de margem de lucro por projeto"
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-6">Performance do Orçamento</h4>
              
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-600">Equipe Técnica</span>
                       <span className="font-bold text-slate-900">85%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[85%] rounded-full"></div>
                    </div>
                 </div>
                 
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-600">Logística</span>
                       <span className="font-bold text-red-500">105% (Estourado)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-red-500 w-[100%] rounded-full"></div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-600">Alimentação</span>
                       <span className="font-bold text-slate-900">45%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[45%] rounded-full"></div>
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-xs text-slate-500">Custo Total Estimado</p>
                    <p className="text-xl font-bold text-slate-900">R$ 350k</p>
                 </div>
                 <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <TrendingUp size={20} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </SolutionLayout>
  );
};

export default CostEstimation;
