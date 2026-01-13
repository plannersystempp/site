import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppFloating from './WhatsAppFloating';
import ContactModal from './Modals/ContactModal';
import PlansModal from './Modals/PlansModal';
import { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface SolutionLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  gradient?: string;
}

const SolutionLayout: React.FC<SolutionLayoutProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  children,
  gradient = "from-blue-600 to-indigo-600"
}) => {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const openPlansModal = () => setShowPlansModal(true);
  const closePlansModal = () => setShowPlansModal(false);
  
  const openContactModal = () => setShowContactModal(true);
  const closeContactModal = () => setShowContactModal(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans text-slate-600 bg-white selection:bg-blue-900 selection:text-white overflow-x-hidden relative min-h-screen flex flex-col">
      <Navbar 
        onContactClick={openContactModal}
        onPlansClick={openPlansModal}
      />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 text-white`}>
                    <Icon size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl">
                    {description}
                </p>
                <button 
                    onClick={openContactModal}
                    className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-medium text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
                >
                    Começar Agora
                </button>
            </div>
        </div>
        {/* Background Blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[500px] bg-blue-400/5 blur-[120px] -z-10 rounded-full"></div>
      </div>

      {/* Main Content */}
      <main className="flex-grow pb-20">
        <div className="container mx-auto px-6 md:px-12">
            {children}
        </div>
      </main>

      <Footer onContactClick={openContactModal} />
      <WhatsAppFloating />
      
      {showContactModal && <ContactModal onClose={closeContactModal} />}
      {showPlansModal && <PlansModal onClose={closePlansModal} onContactClick={() => { closePlansModal(); openContactModal(); }} />}
    </div>
  );
};

export default SolutionLayout;
