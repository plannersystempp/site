import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, ArrowRight } from 'lucide-react';

interface FooterProps {
  onContactClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onContactClick }) => {
  return (
    <footer className="bg-[#0f172a] text-slate-300">
      
      {/* FULL WIDTH CTA INTEGRATED INTO FOOTER */}
      <div className="w-full bg-gradient-to-r from-blue-700 to-[#0f172a] py-24 relative overflow-hidden">
           
          {/* Background Abstract Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
              <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px]"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
                Experimente o futuro da gestão de eventos.
              </h2>
              <p className="text-blue-100 text-lg md:text-xl mb-10 font-light max-w-2xl mx-auto leading-relaxed">
                Agende um teste prático em um evento real e sinta a diferença na organização e no bolso. Sem compromisso.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={onContactClick}
                  className="bg-white text-blue-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                >
                  Agendar demonstração
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* FOOTER CONTENT */}
      <div id="sobre" className="container mx-auto px-6 pt-20 pb-12">
        <div className="flex flex-col items-center justify-center text-center mb-16 border-b border-slate-800 pb-12">
           
           {/* LOGO FOOTER */}
           <div className="flex items-center gap-3 mb-6">
              <img src="/logo_plannersystem.png" alt="PlannerSystem" className="h-6 w-auto object-contain brightness-0 invert" loading="lazy" decoding="async" />
           </div>

           <p className="text-lg text-slate-400 font-light max-w-xl mx-auto">
             A parceira oficial do produtor de eventos para simplificar a operação e maximizar resultados financeiros.
           </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-10 mb-20 text-center md:text-left justify-items-center md:justify-items-start max-w-6xl mx-auto">
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-bold mb-6 text-sm">Produto</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#funcionalidades" className="hover:text-blue-400 transition-colors">Funcionalidades</a></li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-bold mb-6 text-sm">Empresa</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#sobre" className="hover:text-blue-400 transition-colors">Sobre nós</a></li>
              <li>
                <button onClick={onContactClick} className="hover:text-blue-400 transition-colors text-left">
                  Contato
                </button>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-bold mb-6 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/privacidade" className="hover:text-blue-400 transition-colors">Privacidade</Link></li>
              <li><Link to="/termos-de-uso" className="hover:text-blue-400 transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-bold mb-6 text-sm">Social</h4>
            <div className="flex gap-4">
               <a href="https://www.instagram.com/plannersys/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><Instagram size={18} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-center items-center text-sm text-slate-500">
           <span className="text-slate-600 text-center">© 2024 PlannerSystem Tecnologia para Eventos Ltda. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
