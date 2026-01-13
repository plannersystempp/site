import React from 'react'
import { renderToString } from 'react-dom/server'
import DashboardPreview from './DashboardPreview'

const html = renderToString(<DashboardPreview />)
const labels = [
  'Atividade',
  'EM ANDAMENTO',
  'MÉDIA SEMANAL',
  'MÉDIA MENSAL',
  'Status',
  'Evolução de Eventos',
]

labels.forEach((label) => {
  if (!html.includes(label)) {
    throw new Error(`Rótulo não encontrado: ${label}`)
  }
})

export {}
