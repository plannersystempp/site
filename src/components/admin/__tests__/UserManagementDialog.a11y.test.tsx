import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { UserManagementDialog } from '../UserManagementDialog'

// Mock de Dialog para evitar portal/contexto do Radix no SSR
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => children,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

describe('UserManagementDialog a11y', () => {
  it('renderiza título e descrição para ação de alterar função', () => {
    const html = renderToStaticMarkup(
      <UserManagementDialog
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        userId="user_123"
        userName="Maria"
        currentRole="user"
        currentApproved={true}
        currentTeamId={null}
        currentTeamName={null}
        teams={[]}
        actionType="role"
      />
    )
    expect(html).toContain('Alterar Função do Usuário')
    // Em SSR, as aspas são escapadas como &quot;
    expect(html).toContain('Altere a função do usuário &quot;Maria&quot; no sistema.')
  })
})