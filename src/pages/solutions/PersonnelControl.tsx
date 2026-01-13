import React from 'react';
import { Users, CheckCircle, Shield, Star } from 'lucide-react';
import SolutionLayout from '../../components/SolutionLayout';

const PersonnelControl: React.FC = () => {
  return (
    <SolutionLayout
      title="Controle Pessoal"
      description="Cadastre funcionários fixos e freelancers, defina funções e gerencie alocações por divisão de forma eficiente."
      icon={Users}
      gradient="from-purple-600 to-pink-600"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="order-2 md:order-1 bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm">
           {/* Mockup Card */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden">
                    <img src="/images/gabriela-marinho.jpg" alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-900">Gabriela Marinho</h3>
                    <p className="text-blue-600 font-medium">Produtora Executiva</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase font-bold">Documentação</p>
                    <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                       <Shield size={14} /> Verificada
                    </div>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase font-bold">Avaliação</p>
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                       <Star size={14} fill="currentColor" /> 4.9/5.0
                    </div>
                 </div>
              </div>
              <div className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg text-center text-sm font-bold">
                 Disponível para alocação
              </div>
           </div>
        </div>
        
        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Sua equipe organizada</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-6">
            Mantenha um banco de talentos atualizado e organizado. Saiba exatamente quem está disponível, suas habilidades e histórico de performance.
          </p>
          <ul className="space-y-4">
            {[
              "Cadastro completo (CLT, PJ e Freelancers)",
              "Gestão de documentos e contratos",
              "Histórico de projetos realizados",
              "Avaliação de desempenho pós-evento"
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

export default PersonnelControl;
