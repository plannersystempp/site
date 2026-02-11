"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, X } from 'lucide-react';

const PrivacyWidget: React.FC = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const togglePrivacy = () => {
    setShowPrivacyModal(!showPrivacyModal);
  };

  const handleAccept = () => {
    localStorage.setItem('privacyAccepted', 'true');
    setShowPrivacyModal(false);
  };

  const handleReject = () => {
    localStorage.setItem('privacyAccepted', 'false');
    setShowPrivacyModal(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 hidden md:flex flex-col gap-4">
      
      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="privacy-title" className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] border border-slate-100 animate-in slide-in-from-bottom-10 fade-in duration-500">
           <div className="flex justify-between items-start mb-4">
              <h3 id="privacy-title" className="text-lg font-bold text-blue-600">Controle sua privacidade</h3>
              <span className="text-xs font-semibold text-slate-400">AdOpt</span>
           </div>
           
           <p className="text-sm text-slate-600 mb-4">
              Nosso site usa cookies para melhorar a navegação.
           </p>
           
           <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-500 italic">
                 Usamos cookies para compartilhar dados de análise, publicidade, dados de usuários e personalização de anúncios com o Google.
              </p>
           </div>

           <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-blue-600 font-medium mb-6 underline-offset-2">
              <Link href="/privacidade" className="hover:underline">Política de Privacidade</Link>
              <Link href="/privacidade" className="hover:underline">Política de Cookies</Link>
              <Link href="/termos-de-uso" className="hover:underline">Termos de uso</Link>
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Opt-out
              </a>
           </div>

           <div className="flex items-center justify-between gap-3">
              <button className="text-sm font-bold text-slate-600 hover:text-blue-600 underline decoration-slate-300 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                 Minhas opções
              </button>
              <div className="flex gap-2">
                 <button 
                    onClick={handleReject}
                    className="px-4 py-2 rounded-full border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                 >
                    Rejeitar
                 </button>
                 <button 
                    onClick={handleAccept}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                 >
                    Aceitar
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Floating Lock Icon Button */}
      <button 
        onClick={togglePrivacy}
        aria-label="Abrir opções de privacidade"
        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform self-start ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
         <Lock size={20} />
      </button>
    </div>
  );
};

export default PrivacyWidget;
