import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { KpiCard } from '../KpiCard';

describe('KpiCard size', () => {
  it('renderiza valor com classe menor quando size="sm"', () => {
    const html = renderToStaticMarkup(
      <KpiCard title="Teste" value={10} size="sm" />
    );
    expect(html).toContain('text-xl');
  });

  it('renderiza valor padrão com classe maior quando size não informado', () => {
    const html = renderToStaticMarkup(
      <KpiCard title="Teste" value={10} />
    );
    expect(html).toContain('text-2xl');
  });
});