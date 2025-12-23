import { describe, it, expect } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function DialogTestComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>Abrir diálogo</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título de Diálogo</DialogTitle>
        </DialogHeader>
        <p>Conteúdo acessível dentro do diálogo.</p>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog focus a11y', () => {
  it('retorna o foco ao trigger após fechar o diálogo', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(<DialogTestComponent />)
      await new Promise((r) => setTimeout(r, 0))
    })

    const trigger = container.querySelector('button') as HTMLButtonElement
    expect(trigger).toBeTruthy()

    // Abre o diálogo
    await act(async () => {
      trigger.click()
      await new Promise((r) => setTimeout(r, 0))
    })

    // Verifica que conteúdo apareceu
    expect(document.body.innerHTML).toContain('Título de Diálogo')

    // Fecha via botão de fechar (aria-label="Fechar")
    const closeBtn = document.querySelector('button[aria-label="Fechar"]') as HTMLButtonElement | null
    expect(closeBtn).toBeTruthy()

    await act(async () => {
      closeBtn?.click()
      await new Promise((r) => setTimeout(r, 0))
    })

    // Foco deve retornar ao trigger
    expect(document.activeElement).toBe(trigger)
  })

  it('fecha com tecla Escape e retorna foco ao trigger', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(<DialogTestComponent />)
      await new Promise((r) => setTimeout(r, 0))
    })

    const trigger = container.querySelector('button') as HTMLButtonElement
    expect(trigger).toBeTruthy()

    await act(async () => {
      trigger.click()
      await new Promise((r) => setTimeout(r, 0))
    })

    // Dispara Escape
    await act(async () => {
      const evt = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(evt)
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(document.activeElement).toBe(trigger)
  })
})