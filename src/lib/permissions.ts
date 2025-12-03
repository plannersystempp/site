export const canShowSuppliersModule = (
  userRole: string | null,
  _teamFlag?: boolean,
  memberCaps?: { canAccessSuppliers?: boolean }
) => {
  if (!userRole) return false;
  if (userRole === 'admin' || userRole === 'financeiro') return true;
  if (userRole === 'coordinator') {
    return !!memberCaps?.canAccessSuppliers;
  }
  return false;
};
