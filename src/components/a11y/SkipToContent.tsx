import React from 'react';
import { focusMainContent } from '@/utils/a11y';

/**
 * Link de acessibilidade para pular direto ao conteúdo principal.
 * Visível ao receber foco via teclado.
 */
export const SkipToContent: React.FC = () => {
  const handleActivate = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Permite navegação padrão via href e também garante foco programático
    focusMainContent();
  };

  return (
    <a
      href="#conteudo-principal"
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleActivate(e);
        }
      }}
      className="sr-only focus:not-sr-only fixed top-2 left-2 z-50 px-3 py-2 rounded-md bg-primary text-primary-foreground shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      aria-label="Pular para o conteúdo principal"
    >
      Pular para o conteúdo principal
    </a>
  );
};