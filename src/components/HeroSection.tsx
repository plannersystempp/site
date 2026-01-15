import React from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Play } from 'lucide-react';
import { useCarousel } from '../hooks/useCarousel';
import DashboardPreview from './previews/DashboardPreview';
import FinancialPreview from './previews/FinancialPreview';

interface HeroSectionProps {
  onContactClick: () => void;
}

const slides = [
  {
    id: 1,
    title: "Dashboard de Gestão",
    description: "Visão macro de todos os seus eventos em tempo real. Acompanhe custos, staff e status.",
    type: "desktop" as const,
    gradient: "from-blue-600 to-indigo-600",
    image: "/images/dashboard-preview.png",
    useImage: true
  },
  {
    id: 2,
    title: "Banco de dados organizado",
    description: "Tenha o controle de cada colaborador, com todas as informações cruciais.",
    type: "mobile" as const,
    gradient: "from-purple-600 to-pink-600",
    image: "/images/Pessoal.png",
    useImage: true
  },
  {
    id: 3,
    title: "Controle Financeiro",
    description: "Tenha estimativas de custos dos seus eventos antes mesmo deles acontecerem.",
    type: "desktop" as const,
    gradient: "from-emerald-600 to-teal-600",
    image: "/images/finance-preview.png",
    useImage: true
  }
];

const HeroSection: React.FC<HeroSectionProps> = ({ onContactClick }) => {
  const { current: currentSlide, next: nextSlide, prev: prevSlide } = useCarousel(slides, null);

  return (
    <header className="relative pt-32 pb-20 lg:pt-44 lg:pb-24 overflow-hidden bg-white">
      <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          A evolução da gestão de eventos
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-6 max-w-4xl tracking-tight">
          Um ecossistema completo para a <span className="text-blue-600">gestão de eventos</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
          SaaS definitivo para gestão de eventos corporativos. Substitua planilhas por controle total, da operação ao financeiro, em uma única plataforma.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto mb-16">
          <button 
            onClick={onContactClick}
            className="bg-blue-600 text-white px-8 py-4 rounded-full font-medium text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 min-w-[200px]"
          >
            Solicitar demonstração
          </button>
          <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-medium text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2 min-w-[200px]">
            Ver vídeo do produto <Play size={14} fill="currentColor" />
          </button>
        </div>

        <div className="relative w-full max-w-[1600px] mx-auto h-[500px] md:h-[600px] flex items-center justify-center perspective-1000 mt-8">
          
          <button onClick={prevSlide} className="absolute left-2 md:left-10 z-30 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-110 transition-all border border-slate-100">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} className="absolute right-2 md:right-10 z-30 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-110 transition-all border border-slate-100">
            <ChevronRight size={24} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            {slides.map((slide, index) => {
              let position = "hidden"; 
              if (index === currentSlide) position = "active";
              else if (index === (currentSlide - 1 + slides.length) % slides.length) position = "prev";
              else if (index === (currentSlide + 1) % slides.length) position = "next";

              const baseClasses = "absolute transition-all duration-700 ease-in-out rounded-[2rem] shadow-2xl p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16 overflow-hidden border border-slate-100";
              
              let stateClasses = "";
              if (position === "active") {
                stateClasses = `z-20 w-[95%] md:w-[85%] h-[90%] opacity-100 scale-100 bg-gradient-to-br ${slide.gradient} text-white translate-x-0`;
              } else if (position === "prev") {
                stateClasses = "z-10 w-[80%] h-[80%] opacity-40 scale-95 bg-white text-slate-400 -translate-x-[60%] md:-translate-x-[55%] cursor-pointer hover:opacity-60";
              } else if (position === "next") {
                stateClasses = "z-10 w-[80%] h-[80%] opacity-40 scale-95 bg-white text-slate-400 translate-x-[60%] md:translate-x-[55%] cursor-pointer hover:opacity-60";
              } else {
                stateClasses = "z-0 opacity-0 scale-50";
              }

              const handleSlideClick = () => {
                if (position === "prev") prevSlide();
                if (position === "next") nextSlide();
              };

              return (
                <div 
                  key={slide.id} 
                  className={`${baseClasses} ${stateClasses}`}
                  onClick={handleSlideClick}
                >
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                  <div className="w-full md:w-1/3 relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${position === 'active' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      Preview {index + 1}/{slides.length}
                    </div>
                    <h3 className={`text-2xl md:text-4xl font-bold mb-4 ${position === 'active' ? 'text-white' : 'text-slate-300'}`}>
                      {slide.title}
                    </h3>
                    <p className={`text-base md:text-lg mb-8 leading-relaxed ${position === 'active' ? 'text-blue-50' : 'text-slate-300'}`}>
                      {slide.description}
                    </p>
                    <button className={`px-6 py-3 rounded-full font-bold transition-all text-sm ${position === 'active' ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-slate-200 text-slate-400'}`}>
                      Ver detalhes
                    </button>
                  </div>

                  <div className="w-full md:w-2/3 h-full relative z-10 flex items-center justify-center">
                    {slide.type === 'desktop' ? (
                      slide.id === 3 ? <FinancialPreview /> : <DashboardPreview />
                    ) : (
                      <div className="w-52 h-96 rounded-[2rem] shadow-xl overflow-hidden relative bg-transparent">
                        <Image 
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          priority={index === 0}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, i) => (
              <button 
                key={i}
                onClick={() => {
                  const carousel = document.querySelector('.relative.w-full.h-full.flex.items-center.justify-center');
                  if (carousel) {
                    const currentIndex = i;
                    const event = new CustomEvent('slideChange', { detail: currentIndex });
                    carousel.dispatchEvent(event);
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-400/10 blur-[120px] -z-10 rounded-full"></div>
      </div>
    </header>
  );
};

export default HeroSection;
