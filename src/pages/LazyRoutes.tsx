// FASE 6: Lazy Loading de Rotas Pesadas
import { lazy } from 'react';

// Lazy load páginas pesadas do SuperAdmin
export const SuperAdminPage = lazy(() => import('./SuperAdmin'));
export const ManageSubscriptionPage = lazy(() => import('./ManageSubscription'));
