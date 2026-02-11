"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Phone, Mail, User, Building, MessageCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const primeiroCampoRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    role: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const focar = () => {
      primeiroCampoRef.current?.focus();
    };

    const timeout = window.setTimeout(focar, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', phone: '', email: '', company: '', role: '', message: '' });
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Ocorreu um erro ao enviar.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="bg-white rounded-[2rem] w-full max-w-4xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-auto md:h-[600px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contato-titulo"
          aria-describedby="contato-descricao"
        >
        
        <button 
          onClick={onClose}
          type="button"
          aria-label="Fechar modal de contato"
          className="absolute top-3 right-3 p-1.5 bg-white/50 backdrop-blur rounded-full hover:bg-slate-100 transition-colors z-20 shadow-sm"
        >
          <X size={18} className="text-slate-600" />
        </button>

        <div className="w-full md:w-5/12 bg-blue-600 text-white p-6 md:p-10 flex flex-col justify-between relative overflow-hidden shrink-0">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600 to-indigo-700 z-0"></div>
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
           <div className="absolute bottom-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>

           <div className="relative z-10">
             <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 md:mb-8">
                <MessageSquare size={12} /> Contato Comercial
             </div>
             <h2 id="contato-titulo" className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 leading-tight">Vamos levar seu evento para o próximo nível?</h2>
             <p id="contato-descricao" className="text-blue-100 text-xs md:text-sm leading-relaxed">
                Nossa equipe de especialistas está pronta para entender seus desafios e apresentar a solução ideal para sua operação.
             </p>
           </div>

           <div className="relative z-10 space-y-3 md:space-y-4 mt-6 md:mt-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Phone size={14} />
                 </div>
                 <span className="text-sm font-medium">+55 21 96586-5470</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Mail size={14} />
                 </div>
                 <a href="mailto:contato@plannersystem.com.br" className="text-sm font-medium hover:text-blue-200 transition-colors">contato@plannersystem.com.br</a>
              </div>
           </div>
        </div>

        <div className="w-full md:w-7/12 p-6 md:p-10 bg-slate-50 overflow-y-auto">
           <div className="mb-5 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">Fale com nossos especialistas</h3>
              <p className="text-xs md:text-sm text-slate-500">Preencha o formulário abaixo e entraremos em contato em breve.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide">Nome Completo</label>
                    <div className="relative">
                       <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         name="name"
                         ref={primeiroCampoRef}
                         value={formData.name}
                         onChange={handleInputChange}
                         className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300" 
                         placeholder="Seu nome" 
                         required
                       />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide">Telefone / WhatsApp</label>
                    <div className="relative">
                       <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="tel" 
                         name="phone"
                         value={formData.phone}
                         onChange={handleInputChange}
                         className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300" 
                         placeholder="(00) 00000-0000" 
                         required
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide">E-mail Corporativo</label>
                 <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300" 
                      placeholder="seuemail@empresa.com" 
                      required
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide">Empresa</label>
                    <div className="relative">
                       <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         name="company"
                         value={formData.company}
                         onChange={handleInputChange}
                         className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300" 
                         placeholder="Nome da empresa" 
                         required
                       />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide">Cargo</label>
                    <input 
                      type="text" 
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300" 
                      placeholder="Ex: Diretor, Produtor" 
                      required
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide">Mensagem (Opcional)</label>
                 <textarea 
                   name="message"
                   value={formData.message}
                   onChange={handleInputChange}
                   className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 min-h-[60px]" 
                   placeholder="Conte um pouco sobre sua necessidade..."
                 ></textarea>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 mb-2">
                   <CheckCircle size={16} />
                   Solicitação enviada com sucesso! Entraremos em contato em breve.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2 mb-2">
                   <AlertCircle size={16} />
                   {errorMessage}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || submitStatus === 'success'}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                 {isSubmitting ? (
                    <>
                       <Loader2 size={18} className="animate-spin" />
                       Enviando...
                    </>
                 ) : (
                    'Enviar Solicitação'
                 )}
              </button>
           </form>
        </div>

      </div>
      </div>
    </div>
  );
};

export default ContactModal;
