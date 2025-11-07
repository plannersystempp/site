import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PlanFormDialog } from '../PlanFormDialog'

// Mock para evitar dependência do React Query no SSR
vi.mock('@/hooks/usePlanMutations', () => ({
  usePlanMutations: () => ({
    createPlan: { isPending: false, mutate: () => {} },
    updatePlan: { isPending: false, mutate: () => {} },
  }),
}))

// Mock de Dialog para evitar portal/contexto do Radix no SSR
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => children,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

describe('PlanFormDialog a11y', () => {
  it('renderiza título e descrição em modo criar', () => {
    const html = renderToStaticMarkup(
      <PlanFormDialog
        open={true}
        onOpenChange={() => {}}
        plan={null}
      />
    )
    expect(html).toContain('Criar Novo Plano')
    expect(html).toContain('Preencha os dados para criar um novo plano')
  })
})