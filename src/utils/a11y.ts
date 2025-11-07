// Utilidades de Acessibilidade (a11y)
// Idioma: pt-br

/**
 * Foca um elemento pelo seu id, se existir e for focável.
 * Retorna true se o foco foi aplicado com sucesso, caso contrário false.
 */
export function focusElementById(id: string): boolean {
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;

  // Garante foco programático em elementos que não são naturalmente focáveis
  const prevTabIndex = (el as HTMLElement).getAttribute('tabindex');
  const needsTabIndex = prevTabIndex === null;
  if (needsTabIndex) {
    (el as HTMLElement).setAttribute('tabindex', '-1');
  }

  (el as HTMLElement).focus({ preventScroll: false });

  // Restaura estado anterior caso tenha sido alterado
  if (needsTabIndex) {
    (el as HTMLElement).removeAttribute('tabindex');
  }

  return document.activeElement === el;
}

/**
 * Move o foco para a região de conteúdo principal padrão.
 * Usa o id "conteudo-principal" por convenção de projeto.
 */
export function focusMainContent(): boolean {
  return focusElementById('conteudo-principal');
}