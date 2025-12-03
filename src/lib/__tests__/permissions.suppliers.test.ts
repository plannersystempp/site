import { describe, it, expect } from 'vitest';
import { canShowSuppliersModule } from '../../lib/permissions';

describe('canShowSuppliersModule', () => {
  it('permite admin sempre', () => {
    expect(canShowSuppliersModule('admin')).toBe(true);
  });

  it('permite financeiro sempre', () => {
    expect(canShowSuppliersModule('financeiro')).toBe(true);
  });

  it('bloqueia usuário comum', () => {
    expect(canShowSuppliersModule('user')).toBe(false);
  });

  it('coordenador com flag da equipe habilitada (ignorada)', () => {
    expect(canShowSuppliersModule('coordinator', true, { canAccessSuppliers: false })).toBe(false);
  });

  it('coordenador com acesso individual habilitado', () => {
    expect(canShowSuppliersModule('coordinator', false, { canAccessSuppliers: true })).toBe(true);
  });

  it('coordenador sem flags', () => {
    expect(canShowSuppliersModule('coordinator', false, { canAccessSuppliers: false })).toBe(false);
  });
});
