import React from 'react';
import Image from 'next/image';

interface BenefitSectionProps {
  title: string;
  description: string;
  imageSrc?: string; // Opcional, se não tiver, usa um placeholder
  imageAlt?: string;
  reverse?: boolean; // Se true, imagem à esquerda
  benefits?: string[]; // Lista de checkmarks
  customVisual?: React.ReactNode; // Componente visual customizado (substitui imagem)
  cleanImage?: boolean; // Se true, remove moldura (shadow e rounded)
}

const BenefitSection: React.FC<BenefitSectionProps> = ({ 
  title, 
  description, 
  imageSrc, 
  imageAlt = "Ilustração do benefício", 
  reverse = false,
  benefits = [],
  customVisual,
  cleanImage = false
}) => {
  return (
    <section className={`py-16 ${reverse ? 'bg-slate-50' : 'bg-white'}`}>
      <div className="container mx-auto px-6 md:px-12">
        <div className={`flex flex-col md:flex-row items-center gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Conteúdo de Texto */}
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
            <p className="text-lg text-slate-600 leading-relaxed">{description}</p>
            
            {benefits.length > 0 && (
              <ul className="space-y-3 pt-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 min-w-[20px]">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-slate-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Imagem / Mockup */}
          <div className="flex-1 w-full">
            {customVisual ? (
              <div className="w-full transform hover:scale-[1.02] transition-transform duration-500">
                {customVisual}
              </div>
            ) : imageSrc ? (
              <Image 
                src={imageSrc} 
                alt={imageAlt} 
                width={800} 
                height={600} 
                className={`${cleanImage ? '' : 'rounded-2xl shadow-2xl'} w-full object-cover transform hover:scale-[1.02] transition-transform duration-500`} 
              />
            ) : (
              // Mockup Padrão Abstrato
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-inner border border-slate-200 relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                </div>
                <div className="absolute top-4 left-4 right-4 bottom-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50 p-6 flex flex-col gap-4">
                    <div className="h-4 w-1/3 bg-slate-300 rounded animate-pulse"></div>
                    <div className="h-32 bg-slate-200 rounded animate-pulse"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default BenefitSection;
