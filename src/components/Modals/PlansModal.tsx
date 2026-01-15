import React from 'react';
import { X, Zap, Star, Crown, Check, CreditCard, Loader2 } from 'lucide-react';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactClick?: () => void;
}

const plansData = [
  {
    title: "Básico",
    subtitle: "Para pequenas equipes",
    price: "99,90",
    priceId: "price_1SQUKvDPzraaHVSiqT26nyDq",
    icon: <Zap className="w-4 h-4" />,
    features: [
      "Gestão de até 5 eventos/mês",
      "Folha de pagamento simples",
      "Suporte por email",
      "1 Usuário Admin"
    ],
    popular: false,
    color: "blue"
  },
  {
    title: "Profissional",
    subtitle: "Para empresas em crescimento",
    price: "249,90",
    priceId: "price_1SQUhBDPzraaHVSiuNub1VVO",
    icon: <Star className="w-4 h-4" />,
    features: [
      "Eventos ilimitados",
      "Gestão completa de staff",
      "Controle financeiro avançado",
      "Suporte prioritário via chat",
      "Até 5 Usuários Admin",
      "App mobile para staff"
    ],
    popular: true,
    color: "purple"
  },
  {
    title: "Enterprise",
    subtitle: "Para grandes operações",
    price: "499,90",
    priceId: "price_1SQUpPDPzraaHVSiMCzPhxHH",
    icon: <Crown className="w-4 h-4" />,
    features: [
      "Tudo do Profissional",
      "API de integração",
      "Gerente de conta dedicado",
      "Customização de relatórios",
      "SSO & Segurança avançada",
      "Usuários ilimitados"
    ],
    popular: false,
    color: "emerald"
  }
];

const PlansModal: React.FC<PlansModalProps> = ({ isOpen, onClose, onContactClick }) => {
  const { checkout, loading } = useStripeCheckout();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-50 rounded-[1.5rem] w-full max-w-4xl max-h-[95vh] overflow-y-auto relative shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors z-20 text-white border border-white/30"
        >
          <X size={18} />
        </button>

        <div className="bg-blue-600 px-6 py-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700"></div>
            <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 text-white">
               <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-3">
                  Sistema Completo de Gestão de Eventos
               </div>
               <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Eficiência Total em Eventos e Equipes</h2>
               <p className="text-blue-100 text-sm font-light max-w-lg mx-auto leading-relaxed">
                  Potencialize sua operação com a ferramenta certa. Sem surpresas.
               </p>
            </div>
        </div>

        <div className="p-6 md:px-10 md:pb-8 md:pt-8">
          
          <div className="grid md:grid-cols-3 gap-4 items-stretch mb-8">
            {plansData.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-5 rounded-xl border transition-all duration-500 flex flex-col group ${
                  plan.popular 
                    ? 'bg-white shadow-xl border-blue-500 transform md:-translate-y-2 z-10 ring-1 ring-blue-500/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-0.5 rounded-full text-[9px] font-bold shadow-md flex items-center gap-1 tracking-wide uppercase">
                    <Star size={8} fill="currentColor" /> Mais Popular
                  </div>
                )}

                <div className="mb-4 text-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 mx-auto transition-colors ${
                    plan.popular ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                  }`}>
                    {React.cloneElement(plan.icon, { className: "w-4 h-4" })}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-0.5">{plan.title}</h3>
                  <p className="text-[10px] text-slate-500">{plan.subtitle}</p>
                </div>

                <div className="mb-4 pb-4 border-b border-slate-100 text-center">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-xs text-slate-400 font-medium">R$</span>
                    <span className={`text-3xl font-bold tracking-tight ${plan.popular ? 'text-slate-900' : 'text-slate-700'}`}>{plan.price.split(',')[0]}</span>
                    <span className="text-lg font-bold text-slate-400">,{plan.price.split(',')[1]}</span>
                  </div>
                  <span className="text-slate-400 text-[9px] block">/mês</span>
                </div>

                <div className="space-y-2 mb-6 flex-1 px-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 font-medium leading-tight">
                      <div className={`mt-0.5 min-w-[12px] h-3 rounded-full flex items-center justify-center ${plan.popular ? 'text-blue-600' : 'text-slate-400'}`}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </div>

                <button 
                  onClick={() => checkout(plan.priceId)}
                  disabled={loading}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                  plan.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-blue-200/50' 
                    : 'border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assinar Agora'}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center border-t border-slate-200 pt-6">
             <h3 className="text-sm font-bold text-slate-900 mb-2">Planos que não limitam o seu crescimento!</h3>
             
             <div className="flex flex-col items-center gap-3 mt-3">
                <button 
                  onClick={onContactClick}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-green-100 hover:scale-105 flex items-center gap-1.5 group"
                >
                   <Zap size={14} fill="currentColor" className="group-hover:animate-pulse" /> Teste Grátis
                </button>
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">
                   <CreditCard size={10} /> Teste agora sem inserir dados do seu cartão de crédito
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlansModal;