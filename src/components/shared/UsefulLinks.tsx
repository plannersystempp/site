import React from 'react';
import { Link } from 'react-router-dom';

export const UsefulLinks: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-4 text-center md:text-left">
      <h4 className="text-base sm:text-lg font-bold">Links Úteis</h4>
      <nav className="space-y-2 sm:space-y-3 text-sm sm:text-base">
        <Link to="/quem-somos" className="block text-muted-foreground hover:text-primary transition-colors">
          Quem Somos
        </Link>
        <Link to="/termos-de-uso" className="block text-muted-foreground hover:text-primary transition-colors">
          Termos de Uso
        </Link>
        <Link to="/politica-de-privacidade" className="block text-muted-foreground hover:text-primary transition-colors">
          Política de Privacidade
        </Link>
        <Link to="/plans" className="block text-muted-foreground hover:text-primary transition-colors">
          Planos e Preços
        </Link>
      </nav>
    </div>
  );
};
