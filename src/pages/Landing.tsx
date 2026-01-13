import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import BentoGrid from '../components/BentoGrid';
import Testimonials from '../components/Testimonials';
import StatsSection from '../components/StatsSection';
import Footer from '../components/Footer';
import PlansModal from '../components/Modals/PlansModal';
import ContactModal from '../components/Modals/ContactModal';
import WhatsAppFloating from '../components/WhatsAppFloating';
import PrivacyWidget from '../components/PrivacyWidget';

function Landing() {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const openPlansModal = () => setShowPlansModal(true);
  const closePlansModal = () => setShowPlansModal(false);
  
  const openContactModal = () => setShowContactModal(true);
  const closeContactModal = () => setShowContactModal(false);

  return (
    <div className="font-sans text-slate-600 bg-white selection:bg-blue-900 selection:text-white overflow-x-hidden relative">
      
      <Navbar 
        onContactClick={openContactModal}
        onPlansClick={openPlansModal}
      />

      <HeroSection onContactClick={openContactModal} />

      {/* Logo Strip */}
      <div className="border-y border-slate-100 bg-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-medium text-slate-500 mb-8">Empresas líderes confiam na PlannerSystem</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="https://placehold.co/200x80/ffffff/000000?text=LAFTECH" alt="LAFTECH" className="h-10 md:h-12 w-auto object-contain" />
          </div>
        </div>
      </div>

      <BentoGrid />

      {/* Details Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 space-y-32">
          
          {/* Feature Block 1 */}
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
             <div className="mb-12 max-w-2xl">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Gestão de Talentos Unificada</h3>
                <p className="text-lg text-slate-500 font-light">
                  Centralize seu banco de talentos. Histórico, avaliações e valores em um único lugar, facilitando a alocação perfeita para cada evento.
                </p>
             </div>
             
             <div className="w-full bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
                <div className="grid md:grid-cols-3 gap-6">
                   {[
                      { name: 'Aline Gomes', role: 'Freelancer', job: 'Técnica de Som', status: 'active', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
                      { name: 'Carlos Dias', role: 'Freelancer', job: 'Iluminação', status: 'busy', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
                      { name: 'Mariana Costa', role: 'Staff Fixo', job: 'Produção', status: 'active', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
                   ].map((p, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-left">
                         <div className="flex items-center gap-4 mb-4">
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white"
                            />
                            <div>
                               <div className="font-bold text-slate-900">{p.name}</div>
                               <div className="text-xs text-slate-500 uppercase tracking-wide">{p.role}</div>
                            </div>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">{p.job}</span>
                            <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Feature Block 2 */}
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
             <div className="mb-12 max-w-2xl">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Inteligência Financeira em Tempo Real</h3>
                <p className="text-lg text-slate-500 font-light">
                  Dashboards que transformam dados em decisão. Monitore o impacto de horas extras e visualize a saúde financeira de cada projeto.
                </p>
             </div>
             
             <div className="w-full bg-slate-900 rounded-2xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
                <div className="grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700">
                   <div className="pt-4 md:pt-0">
                      <div className="text-slate-400 text-xs font-bold uppercase mb-2">Custo Total</div>
                      <div className="text-3xl font-bold text-white">R$ 48.250</div>
                   </div>
                   <div className="pt-4 md:pt-0">
                      <div className="text-slate-400 text-xs font-bold uppercase mb-2">Cachês</div>
                      <div className="text-3xl font-bold text-white">R$ 48.250</div>
                   </div>
                   <div className="pt-4 md:pt-0">
                      <div className="text-slate-400 text-xs font-bold uppercase mb-2">Horas Extras</div>
                      <div className="text-3xl font-bold text-green-400">R$ 0,00</div>
                   </div>
                   <div className="pt-4 md:pt-0">
                      <div className="text-slate-400 text-xs font-bold uppercase mb-2">Fornecedores</div>
                      <div className="text-3xl font-bold text-blue-400">R$ 15.400</div>
                   </div>
                </div>
                <div className="mt-12 h-32 w-full flex items-end justify-between gap-1 opacity-50">
                   {[20, 40, 30, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-transparent rounded-t-sm" style={{height: `${h}%`}}></div>
                   ))}
                </div>
             </div>
          </div>

          <Testimonials />
        </div>
      </section>

      <StatsSection />
      <Footer onContactClick={openContactModal} />

      <WhatsAppFloating />
      <PrivacyWidget />

      <PlansModal isOpen={showPlansModal} onClose={closePlansModal} />
      <ContactModal isOpen={showContactModal} onClose={closeContactModal} />

      {/* Custom CSS for animations */}
      <style>{`
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .slide-in-from-top-5 {
          animation: slideInFromTop 0.3s ease-out;
        }
        .slide-in-from-bottom-10 {
          animation: slideInFromBottom 0.5s ease-out;
        }
        .zoom-in-95 {
          animation: zoomIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInFromTop {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInFromBottom {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .rotate-y-\[-5deg\] {
          transform: rotateY(-5deg);
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default Landing;
