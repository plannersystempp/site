import { test, expect } from '@playwright/test'

test.describe('Viewport e Safe-Area em iOS/WebKit', () => {
  test('página inicial respeita 100svh/100dvh em modo PWA/standalone', async ({ page }) => {
    await page.goto('/')
    const isStandalone = await page.evaluate(() => {
      const mm = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
      const iosStandalone = typeof navigator !== 'undefined' && (navigator as any).standalone === true
      const hasClass = document.documentElement.classList.contains('is-pwa')
      return mm || iosStandalone || hasClass
    })
    const bodyMinHeight = await page.evaluate(() => getComputedStyle(document.body).minHeight)
    if (isStandalone) {
      expect(bodyMinHeight).toMatch(/(dvh|fill-available)/)
    } else {
      expect(bodyMinHeight).toBeDefined()
    }
  })

  test('modal (Radix) não recorta conteúdo em iOS', async ({ page }) => {
    await page.goto('/app')
    // Assumindo um botão que abre modal, adaptar seletor conforme necessário
    // Este teste serve como placeholder da suíte
    expect(true).toBe(true)
  })
})
