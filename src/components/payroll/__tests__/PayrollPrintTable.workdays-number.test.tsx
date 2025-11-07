// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PayrollPrintTable } from '../PayrollPrintTable';

describe('PayrollPrintTable - dias trabalhados como número', () => {
  it('exibe corretamente a contagem quando workDays é numérico', () => {
    const details = [
      {
        personName: 'Carlos Teste',
        personType: 'freelancer',
        workDays: 5,
        totalOvertimeHours: 0,
        cachePay: 0,
        overtimePay: 0,
        totalPay: 0,
        pendingAmount: 0,
      },
    ];

    const html = renderToStaticMarkup(
      <PayrollPrintTable teamName="Equipe Z" event={{ name: 'Evento' }} details={details as any} showPartialPaid />
    );

    // Deve renderizar uma célula com o valor "5" para os dias trabalhados
    expect(html).toContain('>5<');
    expect(html).toContain('Carlos Teste');
  });
});