import { describe, it, expect } from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { KpiGroup } from '../KpiGroup';

function Harness() {
  return (
    <KpiGroup title="Atividade">
      <div>Card 1</div>
      <div>Card 2</div>
    </KpiGroup>
  );
}

describe('KpiGroup a11y', () => {
  it('renderiza título e filhos e define aria-label', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);

    await act(async () => {
      root.render(<Harness />);
      await new Promise((r) => setTimeout(r, 0));
    });

    const section = document.querySelector('section[aria-label="Atividade"]');
    expect(section).toBeTruthy();
    expect(document.body.innerHTML).toContain('Atividade');
    expect(document.body.innerHTML).toContain('Card 1');
    expect(document.body.innerHTML).toContain('Card 2');
  });
});