import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { SkipToContent } from '../SkipToContent';

describe('SkipToContent', () => {
  it('renderiza um link com href para #conteudo-principal e aria-label em pt-br', () => {
    const html = renderToStaticMarkup(<SkipToContent />);
    expect(html).toContain('href="#conteudo-principal"');
    expect(html).toContain('aria-label="Pular para o conteúdo principal"');
    expect(html).toContain('Pular para o conteúdo principal');
  });
});