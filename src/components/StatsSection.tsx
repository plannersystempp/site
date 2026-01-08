import React from 'react';
import { Star } from 'lucide-react';

const StatsSection: React.FC = () => {
  return (
    <section id="resultados" className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-6 text-center">
         <div className="max-w-3xl mx-auto mb-16">
           <h2 className="text-3xl font-bold text-slate-900 mb-4">Resultados que falam por si</h2>
           <p className="text-slate-500 font-light">
             Nossa tecnologia não apenas organiza, ela transforma a economia dos seus eventos.
           </p>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-6xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
               <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">98%</div>
               <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">Eficiência Operacional</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
               <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">40%</div>
               <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">Redução de Custos</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
               <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">60%</div>
               <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">Ganho de Produtividade</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
               <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">4.9</div>
               <div className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center justify-center gap-1">
                 Nota Média <Star size={12} fill="currentColor" className="text-yellow-500" />
               </div>
            </div>
         </div>
      </div>
    </section>
  );
};

export default StatsSection;