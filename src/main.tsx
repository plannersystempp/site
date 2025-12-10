
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/mobile-utils.css'
import { QueryProvider } from './providers/QueryProvider'

// Sinalizar que o app carregou para evitar o botão de emergência
if (typeof window !== 'undefined') {
  (window as any).__appLoaded = true;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);

// Ocultar splash screen após montagem inicial
const splashEl = document.getElementById('splash');
if (splashEl) {
  // Timeout de segurança - remover splash após 10s mesmo se houver erros
  const safetyTimeout = setTimeout(() => {
    if (splashEl && splashEl.parentNode) {
      console.warn('⚠️ Splash screen removido por timeout de segurança');
      splashEl.style.opacity = '0';
      splashEl.style.transition = 'opacity 250ms ease';
      setTimeout(() => {
        if (splashEl.parentNode) {
          splashEl.remove();
        }
      }, 280);
    }
  }, 10000);
  
  // Remoção normal após montagem
  setTimeout(() => {
    clearTimeout(safetyTimeout);
    if (splashEl && splashEl.parentNode) {
      splashEl.style.opacity = '0';
      splashEl.style.transition = 'opacity 250ms ease';
      setTimeout(() => {
        if (splashEl.parentNode) {
          splashEl.remove();
        }
      }, 280);
    }
  }, 120);
}
