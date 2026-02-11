"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageCircle, ArrowUp } from 'lucide-react';

const WhatsAppFloating: React.FC = () => {
  const [showChat, setShowChat] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openWhatsApp = () => {
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/5521965865470?text=${text}`, "_blank");
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700">
       
       {/* Message Bubble - DESKTOP ONLY */}
      {!isMobile && showChat && (
        <button
          type="button"
          className="bg-white p-4 rounded-xl shadow-xl max-w-[250px] transform transition-all hover:scale-105 cursor-pointer border border-slate-100 relative group text-left"
          onClick={openWhatsApp}
          aria-label="Abrir conversa no WhatsApp"
        >
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-b border-r border-slate-100"></div> 
            <p className="font-bold text-slate-800 mb-1">Bem-vindo(a)!</p>
            <p className="text-slate-500 text-xs">Como podemos ajudar você hoje?</p>
         </button>
       )}

       {/* Input - DESKTOP ONLY */}
      {!isMobile && showChat && (
        <div className="flex bg-white p-1.5 pl-4 rounded-full shadow-2xl items-center gap-2 w-[280px] border border-slate-100 hover:shadow-xl transition-shadow">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva uma mensagem..."
              className="text-sm text-slate-600 flex-1 outline-none bg-transparent placeholder:text-slate-400"
              onKeyDown={(e) => e.key === 'Enter' && openWhatsApp()}
            />
            <button 
               onClick={openWhatsApp}
               className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition-colors shadow-md"
               aria-label="Enviar mensagem no WhatsApp"
            >
               <ArrowUp size={16} /> 
            </button>
         </div>
       )}

       {/* Avatar - DESKTOP ONLY */}
      {!isMobile && (
        <button
          type="button"
          className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-2xl cursor-pointer hover:scale-110 transition-transform relative group"
          onClick={toggleChat}
          aria-label="Abrir chat de atendimento"
          aria-expanded={showChat}
        >
            <Image 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
              alt="Atendente" 
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
         </button>
       )}

       {/* MOBILE ONLY: Simple Blue Chat Icon */}
       {isMobile && (
         <button 
           onClick={openWhatsApp}
           className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95" aria-label="Conversar no WhatsApp"
         >
           <MessageCircle size={28} />
         </button>
       )}
    </div>
  );
};

export default WhatsAppFloating;
