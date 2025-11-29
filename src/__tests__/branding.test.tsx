import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Branding', () => {
  it('sidebar usa logo PNG', () => {
    const p = path.resolve('src/components/AppSidebar.tsx')
    const s = fs.readFileSync(p, 'utf-8')
    expect(s).toContain('/icons/logo_plannersystem.png')
  })

  it('login usa logo PNG', () => {
    const p = path.resolve('src/components/LoginScreen.tsx')
    const s = fs.readFileSync(p, 'utf-8')
    expect(s).toContain('/icons/logo_plannersystem.png')
  })

  it('landing usa logo PNG', () => {
    const p = path.resolve('src/pages/Landing.tsx')
    const s = fs.readFileSync(p, 'utf-8')
    expect(s).toContain('/icons/logo_plannersystem.png')
  })

  it('relatório usa logo PNG', () => {
    const p = path.resolve('src/components/payroll/PayrollPrintTable.tsx')
    const s = fs.readFileSync(p, 'utf-8')
    expect(s).toContain('/icons/logo_plannersystem.png')
  })
})