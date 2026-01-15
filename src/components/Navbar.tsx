import React, { useState } from 'react';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useModal } from '../hooks/useModal';

interface NavbarProps {
  onContactClick: () => void;
  onPlansClick: () => void;
}

const solutionsMenu = [
  {
    icon: 'Calendar',
    title: 'Gestão de Eventos',
    description: 'Crie e gerencie eventos com datas precisas, controle de status e organização completa.',
    path: '/solucoes/gestao-eventos'
  },
  {
    icon: 'Users',
    title: 'Controle Pessoal',
    description: 'Cadastre funcionários fixos e freelancers, defina funções e gerencie alocações por divisão.',
    path: '/solucoes/controle-pessoal'
  },
  {
    icon: 'DollarSign',
    title: 'Folha de Pagamento',
    description: 'Cálculo automático de pagamentos baseados em cachês diários e horas extras.',
    path: '/solucoes/folha-pagamento'
  },
  {
    icon: 'BarChart',
    title: 'Estimativa de Custos',
    description: 'Visualize custos estimados por evento e acompanhe o orçamento em tempo real.',
    path: '/solucoes/estimativa-custos'
  },
  {
    icon: 'FileText',
    title: 'Relatórios Inteligentes',
    description: 'Gere relatórios completos de pagamentos com filtros avançados por período e profissional.',
    path: '/solucoes/relatorios-inteligentes'
  }
];

const Navbar: React.FC<NavbarProps> = ({ onContactClick, onPlansClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      Calendar: <div className="w-5 h-5 text-blue-600">📅</div>,
      Users: <div className="w-5 h-5 text-blue-600">👥</div>,
      Clock: <div className="w-5 h-5 text-blue-600">⏰</div>,
      DollarSign: <div className="w-5 h-5 text-blue-600">💰</div>,
      BarChart: <div className="w-5 h-5 text-blue-600">📊</div>,
      FileText: <div className="w-5 h-5 text-blue-600">📄</div>
    };
    return icons[iconName] || <div className="w-5 h-5 text-blue-600">⚡</div>;
  };

  return (
    <nav 
      role="navigation" aria-label="Navegação principal"
      className={`fixed w-full z-50 transition-all duration-500 ease-in-out bg-white/95 backdrop-blur-md border-b border-slate-100/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center relative">
        
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="Ir para a página inicial" className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
            <Image src="/logo_plannersystem_Azul.png" alt="PlannerSystem" width={150} height={30} className="h-6 w-auto object-contain" priority />
          </Link>
        </div>

        <div className="hidden md:flex items-center justify-center space-x-1">
          
          <div className="group relative">
            <button className="px-4 py-2 text-[15px] font-medium text-slate-600 group-hover:text-blue-600 transition-colors flex items-center gap-1">
              Soluções <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-4 w-[700px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50">
               <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-6 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <div className="grid grid-cols-2 gap-4">
                     {solutionsMenu.map((item, index) => (
                        <Link key={index} href={item.path} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                           <div className="mt-1 p-2 bg-blue-50 rounded-lg group-hover/item:bg-blue-100 transition-colors">
                              {getIconComponent(item.icon)}
                           </div>
                           <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover/item:text-blue-600 transition-colors">{item.title}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          <div className="group relative">
            <button className="px-4 py-2 text-[15px] font-medium text-slate-600 group-hover:text-blue-600 transition-colors flex items-center gap-1">
              Sobre <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-4 w-[650px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50">
               <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-1 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <div className="flex">
                     <div className="w-3/5 p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="w-4 h-4 text-blue-600">🎯</div>
                           <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Missão, Visão e Valores</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-4 leading-tight">
                           O PlannerSystem nasceu para transformar a complexidade da gestão de eventos em clareza estratégica.
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                           Somos a plataforma definitiva para conectar sua equipe e centralizar toda a operação, eliminando planilhas manuais e a falta de visibilidade financeira.
                        </p>
                        <Link href="/sobre" className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/link">
                          Conheça nossa história completa
                          <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                        </Link>
                     </div>
                     
                     <div className="w-2/5 bg-slate-50 p-2">
                        <div className="h-full w-full rounded-xl overflow-hidden relative bg-gradient-to-br from-blue-600 to-slate-800 flex items-end p-6">
                           <div className="relative z-10 text-white">
                              <div className="text-2xl font-bold mb-1">PlannerSystem</div>
                              <div className="text-xs text-blue-100 font-light opacity-80">Tecnologia de ponta para o seu evento.</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <button 
            onClick={onPlansClick} 
            className="px-4 py-2 text-[15px] font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Planos
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <a href="https://app.plannersystem.com.br" className="text-slate-900 font-medium text-[15px] hover:text-blue-600 transition-colors">Login</a>
          <button 
            onClick={onContactClick}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium text-[15px] hover:bg-blue-700 transition-all shadow-sm"
          >
            Falar com vendas
          </button>
        </div>

        <button 
          className="md:hidden text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          aria-controls="menu-mobile"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
        </button>
      </div>

      {isMenuOpen && (
        <div id="menu-mobile" className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col space-y-6 shadow-xl animate-in slide-in-from-top-5 max-h-[85vh] overflow-y-auto">
          
          <div>
            <span className="text-lg font-medium text-slate-800 mb-2 block">Soluções</span>
            <div className="pl-4 border-l-2 border-slate-100 space-y-3">
               {solutionsMenu.map((item, idx) => (
                  <Link key={idx} href={item.path} className="block py-2 group" onClick={() => setIsMenuOpen(false)}>
                     <span className="font-bold block text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</span>
                     <span className="text-xs text-slate-500">{item.description}</span>
                  </Link>
               ))}
            </div>
          </div>

          <div>
            <Link href="/sobre" className="text-lg font-medium text-slate-800 mb-2 block" onClick={() => setIsMenuOpen(false)}>Sobre</Link>
            <div className="pl-4 border-l-2 border-slate-100 py-2">
                <p className="text-sm text-slate-600 italic">Construímos tecnologia para simplificar a gestão de eventos. Nossa missão é eliminar o caos operacional.</p>
            </div>
          </div>

          <button 
            onClick={() => {
              setIsMenuOpen(false);
              onPlansClick();
            }} 
            className="text-lg font-bold text-blue-600 text-left w-full"
          >
            Planos
          </button>
          
          <button 
            className="bg-blue-600 text-white py-3 rounded-lg font-medium w-full" 
            onClick={() => {
              setIsMenuOpen(false);
              onContactClick();
            }}
          >
            Falar com vendas
          </button>
          <a href="https://app.plannersystem.com.br" className="text-slate-600 font-medium w-full py-2 block text-center" onClick={() => setIsMenuOpen(false)}>
            Login
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
