import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { FreelancerRating } from '../FreelancerRating';

vi.mock('@/contexts/TeamContext', () => ({
  useTeam: () => ({ activeTeam: { id: 'team-1' } })
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } })
}));

vi.mock('@/integrations/supabase/client', () => {
  const supabaseUpdateMock = vi.fn(async () => ({ error: null }));
  const supabaseSelectMock = vi.fn(async () => ({ data: { id: 'row-1', rating: 3 }, error: null }));
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    limit: () => builder,
    maybeSingle: supabaseSelectMock,
    update: supabaseUpdateMock,
    insert: vi.fn()
  };
  const supabaseFromMock = vi.fn(() => builder);
  return {
    supabase: { from: supabaseFromMock },
    supabaseUpdateMock,
    supabaseSelectMock,
    supabaseFromMock
  };
});

describe('FreelancerRating - atualização', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('atualiza avaliação existente ao clicar em nova estrela', async () => {
    render(
      <FreelancerRating
        eventId="evt-1"
        freelancerId="p1"
        freelancerName="Teste"
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[4]);
    const { supabaseFromMock, supabaseUpdateMock } = await import('@/integrations/supabase/client');
    expect(supabaseFromMock).toHaveBeenCalledWith('freelancer_ratings');
    expect(supabaseUpdateMock).toHaveBeenCalled();
  });
});

