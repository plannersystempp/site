import React from 'react';
import { DollarSign, CheckCircle, FileText, Download } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';

const Payroll: React.FC = () => {
  return (
    <SolutionLayout
      title="Folha de Pagamento"
      description="Cálculo automático de pagamentos baseados em cachês diários, horas extras e reembolsos."
      icon={DollarSign}
      gradient="from-emerald-500 to-green-600"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="order-2 md:order-1 bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                 <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Total a Pagar</p>
                    <h3 className="text-2xl font-bold text-slate-900">R$ 145.250,00</h3>
                 </div>
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <DollarSign size={20} />
                 </div>
              </div>
              
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Cachês (Diárias)</span>
                    <span className="font-medium">R$ 120.000,00</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Horas Extras</span>
                    <span className="font-medium text-orange-600">+ R$ 22.500,00</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Reembolsos</span>
                    <span className="font-medium">+ R$ 2.750,00</span>
                 </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors mt-2">
                 <FileText size={16} /> Gerar Relatório PDF
              </button>
           </div>
        </div>

        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Fechamento financeiro sem erros</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-6">
            Automatize o processo de fechamento de folha. O sistema consolida horas, cachês e despesas para gerar o valor exato a ser pago para cada profissional.
          </p>
          <ul className="space-y-4">
            {[
              "Consolidação automática de valores",
              "Geração de recibos e holerites",
              "Gestão de reembolsos e despesas extras",
              "Histórico completo de pagamentos por evento"
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

export default Payroll;
