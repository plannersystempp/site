import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChangePlanDialog } from '../ChangePlanDialog'

// Mock de Dialog para evitar portal/contexto do Radix no SSR
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => children,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

// Mock do React Query client utilizado internamente
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    getQueryData: () => undefined,
    setQueryData: () => {},
    invalidateQueries: async () => {},
  }),
}))

describe('ChangePlanDialog a11y', () => {
  it('renderiza título e descrição acessíveis', () => {
    const html = renderToStaticMarkup(
      <ChangePlanDialog
        open={true}
        onOpenChange={() => {}}
        currentSubscriptionId="sub_123"
        currentPlanId="basic"
        teamName="Equipe Teste"
      />
    )
    expect(html).toContain('Alterar Plano')
    expect(html).toContain('Selecione um novo plano')
    expect(html).toContain('Equipe Teste')
  })
})