// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PayrollPrintTable } from '../PayrollPrintTable';

describe('PayrollPrintTable - cachê diário exibido corretamente', () => {
  it('mostra o rate diário e soma apenas no total', () => {
    const details = [
      {
        personName: 'Marina Teste',
        personType: 'freelancer',
        workDays: 3,
        totalOvertimeHours: 0,
        cachePay: 600, // soma de cachê (3 dias x 200)
        overtimePay: 0,
        totalPay: 600,
        pendingAmount: 600,
        cacheRate: 200,
      },
    ];

    const html = renderToStaticMarkup(
      <PayrollPrintTable teamName="Equipe Z" event={{ name: 'Evento' }} details={details as any} showPartialPaid />
    );

    // Deve conter R$ 200,00 (cachê diário) e R$ 600,00 (total)
    expect(html).toMatch(/200,00/);
    expect(html).toMatch(/600,00/);
  });
});