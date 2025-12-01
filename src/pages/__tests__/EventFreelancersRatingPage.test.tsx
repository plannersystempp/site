import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { EventFreelancersRatingPage } from '../EventFreelancersRatingPage';

vi.mock('@/integrations/supabase/client', () => {
  const supabaseInsertMock = vi.fn(async () => ({ error: null }));
  const supabaseFromMock = vi.fn(() => ({ insert: supabaseInsertMock }));
  return {
    supabase: { from: supabaseFromMock },
    supabaseInsertMock,
    supabaseFromMock
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', role: 'admin', isApproved: true } })
}));

vi.mock('@/contexts/TeamContext', () => ({
  useTeam: () => ({ userRole: 'admin', activeTeam: { id: 'team-1' } })
}));

vi.mock('@/contexts/EnhancedDataContext', () => {
  const event = { id: 'evt-1', name: 'Evento Teste' };
  const personnel = [
    { id: 'p1', name: 'Freelancer Um', type: 'freelancer' },
    { id: 'p2', name: 'Funcionario Fixo', type: 'fixo' }
  ];
  const assignments = [
    { id: 'a1', event_id: 'evt-1', personnel_id: 'p1' }
  ];
  return {
    useEnhancedData: () => ({
      events: [event],
      assignments,
      personnel,
      functions: [],
      workLogs: [],
      divisions: [],
      loading: false
    })
  };
});

describe('EventFreelancersRatingPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lista apenas freelancers alocados e envia avaliação ao clicar na estrela', async () => {
    render(
      <MemoryRouter initialEntries={["/app/eventos/evt-1/avaliar-freelancers"]}>
        <Routes>
          <Route path="/app/eventos/:id/avaliar-freelancers" element={<EventFreelancersRatingPage />} />
        </Routes>
      </MemoryRouter>
    );

    const row = await screen.findByText('Freelancer Um');
    expect(row).toBeInTheDocument();
    expect(screen.queryByText('Funcionario Fixo')).not.toBeInTheDocument();

    const container = row.closest('div')!.parentElement!; // container da linha
    const stars = within(container).getAllByRole('button');
    expect(stars.length).toBeGreaterThanOrEqual(5);

    fireEvent.click(stars[3]);

    const { supabaseFromMock, supabaseInsertMock } = await import('@/integrations/supabase/client');
    expect(supabaseFromMock).toHaveBeenCalledWith('freelancer_ratings');
    expect(supabaseInsertMock).toHaveBeenCalledWith({
      team_id: 'team-1',
      event_id: 'evt-1',
      freelancer_id: 'p1',
      rating: 4,
      rated_by_id: 'user-1'
    });
  });
});

