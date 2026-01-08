import React from 'react';
import { Users, Calendar, DollarSign } from 'lucide-react';

const BentoGrid: React.FC = () => {
  return (
    <section id="funcionalidades" className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
         <div className="bg-[#0b1120] rounded-[2.5rem] p-8 md:p-16 lg:p-20 text-white relative overflow-hidden shadow-2xl mx-auto max-w-[1400px]">
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10">
               <div className="max-w-4xl mx-auto text-center mb-16">
                  <div className="inline-block mb-4 px-3 py-1 rounded-sm border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                     Tecnologia Enterprise
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                     Otimize os investimentos em eventos com um stack mais moderno
                  </h2>
                  <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                     Somos projetados para eficiência. Com nossa arquitetura SaaS, você elimina planilhas e domina seu financeiro.
                  </p>

                  <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-medium text-slate-300">
                     <div className="flex items-center gap-2.5"><div className="bg-blue-600 rounded-full p-0.5"><div className="w-3 h-3 rounded-full bg-white"></div></div> Plataforma unificada</div>
                     <div className="flex items-center gap-2.5"><div className="bg-blue-600 rounded-full p-0.5"><div className="w-3 h-3 rounded-full bg-white"></div></div> Serviços na nuvem</div>
                     <div className="flex items-center gap-2.5"><div className="bg-blue-600 rounded-full p-0.5"><div className="w-3 h-3 rounded-full bg-white"></div></div> Infraestrutura elástica</div>
                     <div className="flex items-center gap-2.5"><div className="bg-blue-600 rounded-full p-0.5"><div className="w-3 h-3 rounded-full bg-white"></div></div> TCO reduzido</div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  
                  <div className="col-span-1 row-span-2 bg-[#131b2e] border border-slate-800 rounded-2xl p-8 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all group relative overflow-hidden flex flex-col justify-between h-[500px]">
                     <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-3 text-white">Centralização Total</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Centralize dezenas de arquivos em um painel unificado. Elimine a fragmentação de dados.</p>
                     </div>
                     <div className="mt-8 relative h-64 w-full">
                        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#131b2e] to-transparent z-20"></div>
                        <div className="absolute bottom-[-20px] left-[-20px] w-[120%] h-full grid grid-cols-4 gap-2 transform rotate-12 opacity-20">
                           {[...Array(20)].map((_,i) => <div key={i} className="h-16 bg-slate-700 rounded border border-slate-600"></div>)}
                        </div>
                        <div className="absolute bottom-10 left-6 right-6 h-32 bg-[#1e293b] rounded-xl border border-blue-500/30 shadow-2xl z-10 p-4 transform transition-transform group-hover:-translate-y-2 duration-500">
                            <div className="flex justify-between items-center mb-4">
                               <div className="h-2 w-16 bg-blue-500 rounded"></div>
                               <div className="h-6 w-6 rounded-full bg-slate-700"></div>
                            </div>
                            <div className="space-y-2">
                               <div className="h-2 w-full bg-slate-700 rounded"></div>
                               <div className="h-2 w-2/3 bg-slate-700 rounded"></div>
                            </div>
                        </div>
                     </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 bg-[#131b2e] border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all group overflow-hidden h-[240px] relative">
                       <div className="md:w-1/2 z-10 relative">
                          <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
                             <Users size={20} />
                          </div>
                          <h3 className="text-xl font-bold mb-2 text-white">Equipes de Elite</h3>
                          <p className="text-slate-400 text-sm max-w-xs">Controle local, função e performance de cada operador com perfis detalhados e históricos.</p>
                       </div>
                       <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                             <div className="absolute right-[-20px] top-10 w-48 bg-[#1e293b] rounded-lg p-3 border border-slate-700 transform rotate-[-6deg] shadow-xl z-10 group-hover:rotate-[-8deg] transition-all duration-500">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">AG</div>
                                    <div>
                                       <div className="h-2 w-20 bg-slate-600 rounded mb-1"></div>
                                       <div className="h-1.5 w-12 bg-slate-700 rounded"></div>
                                    </div>
                                 </div>
                             </div>
                             <div className="absolute right-12 top-24 w-48 bg-[#1e293b] rounded-lg p-3 border border-slate-700 transform rotate-[6deg] opacity-60 z-0">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">CD</div>
                                    <div>
                                       <div className="h-2 w-20 bg-slate-600 rounded mb-1"></div>
                                       <div className="h-1.5 w-12 bg-slate-700 rounded"></div>
                                    </div>
                                 </div>
                             </div>
                          </div>
                       </div>
                  </div>

                  <div className="col-span-1 bg-[#131b2e] border border-slate-800 rounded-2xl p-8 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all group relative overflow-hidden h-[236px]">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold mb-2 text-white">Fornecedores</h3>
                          <DollarSign className="text-green-500" size={20} />
                       </div>
                       <p className="text-slate-400 text-sm mb-6">Controle de pagamentos e prazos.</p>
                       <div className="flex items-center gap-2">
                           <span className="text-3xl font-bold text-white">R$ 15.400</span>
                       </div>
                  </div>

                  <div className="col-span-1 bg-[#131b2e] border border-slate-800 rounded-2xl p-8 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all group relative overflow-hidden h-[236px]">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold mb-2 text-white">Múltiplos Eventos</h3>
                          <Calendar className="text-purple-500" size={20} />
                       </div>
                       <p className="text-slate-400 text-sm mb-4">Gerencie múltiplos departamentos simultaneamente.</p>
                       <div className="space-y-2 mt-4">
                           <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              <span>Workshop Fotografia</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              <span>Festival Música</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                              <span>Stand Up Night</span>
                           </div>
                       </div>
                  </div>

               </div>
            </div>
         </div>
      </div>
    </section>
  );
};

export default BentoGrid;
