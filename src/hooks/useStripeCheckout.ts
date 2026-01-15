import { useState } from 'react';

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);

  const checkout = (priceId: string) => {
    setLoading(true);
    
    // Pequeno delay para feedback visual antes do redirecionamento
    setTimeout(() => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.plannersystem.com.br';
      
      // Redireciona para o cadastro no App passando o plano selecionado
      window.location.href = `${appUrl}/auth/signup?plan=${priceId}`;
      
      // Nota: Não setamos loading(false) aqui porque a página vai mudar
    }, 800);
  };

  return { checkout, loading };
};
