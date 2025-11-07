import { describe, it, expect } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'

function ToastTriggerComponent() {
  const { toast } = useToast()
  return (
    <div>
      <button
        onClick={() => toast({ title: 'Ação realizada', description: 'Operação concluída com sucesso.' })}
      >
        Disparar toast
      </button>
      <Toaster />
    </div>
  )
}

describe('Toast trigger a11y', () => {
  it('dispara toast ao clique e anuncia em região aria-live', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(<ToastTriggerComponent />)
      await new Promise((r) => setTimeout(r, 0))
    })

    // Antes do clique, não deve conter texto do toast
    expect(document.body.innerHTML).not.toContain('Ação realizada')

    await act(async () => {
      const button = container.querySelector('button') as HTMLButtonElement
      button.click()
      await new Promise((r) => setTimeout(r, 0))
    })

    const viewport = document.querySelector('[role="status"]') as HTMLElement | null
    expect(viewport).toBeTruthy()
    expect(viewport?.getAttribute('aria-live')).toBe('polite')
    expect(viewport?.getAttribute('aria-atomic')).toBe('true')

    expect(document.body.innerHTML).toContain('Ação realizada')
    expect(document.body.innerHTML).toContain('Operação concluída com sucesso.')
  })
})