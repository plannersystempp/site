import { describe, it, expect, beforeEach } from 'vitest';
import { focusElementById, focusMainContent } from '../../utils/a11y';

describe('utils/a11y', () => {
  beforeEach(() => {
    // Limpa DOM entre testes
    document.body.innerHTML = '';
  });

  it('deve focar elemento existente por id', () => {
    const el = document.createElement('div');
    el.id = 'alvo';
    // torna focável
    el.tabIndex = -1;
    document.body.appendChild(el);

    const ok = focusElementById('alvo');
    expect(ok).toBe(true);
    expect(document.activeElement).toBe(el);
  });

  it('deve retornar false para id inexistente', () => {
    const ok = focusElementById('nao-existe');
    expect(ok).toBe(false);
  });

  it('deve focar conteúdo principal via convenção', () => {
    const main = document.createElement('main');
    main.id = 'conteudo-principal';
    main.tabIndex = -1; // acessível a foco programático
    document.body.appendChild(main);

    const ok = focusMainContent();
    expect(ok).toBe(true);
    expect(document.activeElement).toBe(main);
  });
});