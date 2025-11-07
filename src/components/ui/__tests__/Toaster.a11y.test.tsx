import { describe, it, expect } from 'vitest'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'

function ToastTestHarness() {
  useEffect(() => {
    toast({
      title: 'Sucesso',
      description: 'Plano atualizado com sucesso!'
    })
  }, [])
  return <Toaster />
}

describe('Toaster a11y', () => {
  it('exibe toast em região aria-live "polite" e conteúdo acessível', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(<ToastTestHarness />)
      // aguarda ciclo de renderização
      await new Promise((r) => setTimeout(r, 0))
    })

    const viewport = document.querySelector('[role="status"]') as HTMLElement | null
    expect(viewport).toBeTruthy()

    // Atributos de live region para leitores de tela
    expect(viewport?.getAttribute('aria-live')).toBe('polite')
    expect(viewport?.getAttribute('aria-atomic')).toBe('true')
    // Algumas libs definem role="status" para regiões de toast
    expect(viewport?.getAttribute('role')).toBe('status')

    // Conteúdo visível
    expect(document.body.innerHTML).toContain('Sucesso')
    expect(document.body.innerHTML).toContain('Plano atualizado com sucesso!')
  })
})