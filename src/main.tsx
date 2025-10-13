
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'

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
  // dar um pequeno delay para transição suave
  setTimeout(() => {
    splashEl.style.opacity = '0';
    splashEl.style.transition = 'opacity 250ms ease';
    setTimeout(() => {
      splashEl.remove();
    }, 280);
  }, 120);
}
