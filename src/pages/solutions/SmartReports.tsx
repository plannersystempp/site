import React from 'react';
import { FileText, CheckCircle, Printer, Share2 } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';

const SmartReports: React.FC = () => {
  return (
    <SolutionLayout
      title="Relatórios Inteligentes"
      description="Gere relatórios completos de pagamentos, custos e operações com filtros avançados por período e profissional."
      icon={FileText}
      gradient="from-slate-700 to-slate-900"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="order-2 md:order-1 bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm">
           <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="border-b border-slate-100 p-4 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div className="text-xs text-slate-400 font-mono">relatorio_final.pdf</div>
              </div>
              <div className="p-8 space-y-4">
                 <div className="h-4 bg-slate-100 w-3/4 rounded"></div>
                 <div className="h-4 bg-slate-100 w-1/2 rounded"></div>
                 <div className="h-32 bg-slate-50 rounded border border-slate-100 mt-4 flex items-center justify-center">
                    <div className="text-center">
                       <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                       <span className="text-xs text-slate-400">Visualização de Dados</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="h-2 bg-slate-100 rounded"></div>
                    <div className="h-2 bg-slate-100 rounded"></div>
                    <div className="h-2 bg-slate-100 rounded"></div>
                 </div>
              </div>
           </div>
        </div>

        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Dados para tomada de decisão</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-6">
            Transforme dados operacionais em insights estratégicos. Exporte informações detalhadas para clientes, diretoria ou contabilidade com apenas um clique.
          </p>
          <ul className="space-y-4">
            {[
              "Relatórios personalizados por evento",
              "Exportação em múltiplos formatos (PDF, Excel, CSV)",
              "Dashboards de BI integrados",
              "Histórico e auditoria de alterações"
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SolutionLayout>
  );
};

export default SmartReports;
