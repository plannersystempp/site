import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { EventDetail } from '../EventDetail';

vi.mock('@/contexts/TeamContext', () => {
  return {
    useTeam: () => ({ userRole: 'admin', activeTeam: { id: 'team-1' } })
  };
});

vi.mock('@/contexts/AuthContext', () => {
  return {
    useAuth: () => ({ user: { id: 'user-1', role: 'admin', isApproved: true } })
  };
});

vi.mock('@/hooks/useEventPermissions', () => {
  return {
    useHasEventPermission: () => ({ data: true, isLoading: false })
  };
});

vi.mock('../AllocationManager', () => ({ AllocationManager: () => null }));
vi.mock('../AbsenceHistory', () => ({ AbsenceHistory: () => null }));
vi.mock('../costs/EventCostsTab', () => ({ EventCostsTab: () => null }));
vi.mock('@/components/admin/EventPermissionsManager', () => ({ EventPermissionsManager: () => null }));

vi.mock('@/contexts/EnhancedDataContext', () => {
  const event = { id: 'evt-1', name: 'Evento Teste' };
  return {
    useEnhancedData: () => ({
      events: [event],
      assignments: [],
      personnel: [],
      functions: [],
      workLogs: [],
      divisions: [],
      loading: false,
      deleteEvent: vi.fn()
    })
  };
});

describe('EventDetail - Botão Avaliar Freelancers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renderiza o botão para admin e navega para a rota de avaliação', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={["/app/eventos/evt-1"]}>
          <Routes>
            <Route path="/app/eventos/:id" element={<EventDetail />} />
            <Route path="/app/eventos/:id/avaliar-freelancers" element={<div>Pagina Avaliacao</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const btn = await screen.findByRole('button', { name: /Avaliar Freelancers/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    await screen.findByText('Pagina Avaliacao');
  });
});

