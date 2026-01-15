import React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useCarousel } from '../hooks/useCarousel';

const testimonials = [
  {
    id: 1,
    quote: "O PlannerSystem veio acrescentar qualidade no dia a dia dos nossos pagamentos. É uma ferramenta que proporciona visibilidade abrangente a respeito dos eventos em andamento, realizados e futuros. Integra informações importantes sobre a equipe técnica, permite lançamento de custos por evento e aumenta a produtividade financeira da empresa. Tenho certeza de que fizemos um excelente investimento.",
    author: "Gabriela Marinho",
    role: "Controle Operacional",
    company: "Laftech",
    image: "/images/gabriela-marinho.jpg"
  }
];

const Testimonials: React.FC = () => {
  const { current: currentTestimonial, next: nextTestimonial, prev: prevTestimonial } = useCarousel(testimonials, testimonials.length > 1 ? 5000 : null);

  return (
    <div className="pt-10 max-w-6xl mx-auto">
       <div className="relative bg-slate-50 rounded-[2rem] p-10 md:p-16 overflow-hidden border border-slate-100 shadow-sm">
          
          <div className="absolute top-10 left-10 opacity-10">
             <Quote size={120} className="text-blue-600" fill="currentColor" />
          </div>

          <div className="relative z-10">
             <div className="flex flex-col items-center justify-center text-center">
                
                <div className="w-full grid grid-cols-1 place-items-center">
                   {testimonials.map((testi, index) => (
                      <div 
                         key={testi.id} 
                         className={`col-start-1 row-start-1 w-full flex flex-col items-center justify-center text-center transition-all duration-700 ease-in-out px-4 ${
                            index === currentTestimonial 
                              ? 'opacity-100 translate-x-0 scale-100 z-20' 
                              : 'opacity-0 translate-x-10 scale-95 z-10 pointer-events-none'
                         }`}
                      >
                         <p className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed mb-8 max-w-4xl">
                            "{testi.quote}"
                         </p>
                          
                         <div className="flex flex-col items-center gap-2">
                            
                           <Image 
                             src={testi.image} 
                             alt={testi.author} 
                             width={64}
                             height={64}
                             className="w-16 h-16 rounded-full object-cover mb-4 shadow-lg border-4 border-white"
                             referrerPolicy="no-referrer"
                           />
                            
                            <div>
                               <h4 className="font-bold text-slate-900 text-lg">{testi.author}</h4>
                               <p className="text-slate-500 text-sm">{testi.role}, <span className="font-semibold text-blue-600">{testi.company}</span></p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                {testimonials.length > 1 && (
                  <div className="flex gap-4 mt-12">
                     <button onClick={prevTestimonial} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-all bg-white shadow-sm">
                        <ChevronLeft size={24} />
                     </button>
                     <button onClick={nextTestimonial} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-all bg-white shadow-sm">
                        <ChevronRight size={24} />
                     </button>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default Testimonials;
