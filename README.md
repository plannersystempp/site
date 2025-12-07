# PlannerSystem — Sistema de Gestão de Eventos

PlannerSystem é um sistema web para gestão de eventos, equipes e custos, com foco em performance, UX e recursos PWA. Este repositório usa Vite + React + TypeScript + Tailwind.

## Requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
npm install
```

## Desenvolvimento

- Servidor local na porta `8080` (preferência):
  ```bash
  npm run dev -- --port 8080 --strictPort
  ```
- Acesse `http://localhost:8080/app`.

## Build e Preview

```bash
npm run build
npm run preview
```

## PWA e Ícones

- Manifestos atualizados em `public/manifest.json` e `public/site.webmanifest`.
- Ícones maskable e padrão gerados a partir de `public/icons/plannersystem-logo.svg`.
- Ícone pinned (Safari) em `public/safari-pinned-tab.svg` com cor definida em `index.html` (`<link rel="mask-icon" color="#0979FF">`).

Para regenerar favicons e ícones:
```bash
npm run icons:gen
```

## Estrutura do Projeto (resumo)

- `src/` — aplicação (componentes, páginas, serviços, hooks, utils).
- `public/` — assets estáticos, SW, manifestos e ícones.
- `supabase/` — configurações, migrations e funções Edge.

## Scripts úteis

- `npm run dev` — servidor de desenvolvimento.
- `npm run build` — build de produção.
- `npm run preview` — preview do build (porta padrão do Vite).
- `npm run icons:gen` — gerar favicons e ícones a partir do SVG.
- `npm run test` — executar testes.
- `npm run lint` — lint do projeto.

## Convenções

- Commits Semânticos: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Idioma padrão: pt-BR (código, comentários e documentação).

## Deploy

- Pode ser publicado na Vercel. Ajuste configurações em `vercel.json` conforme necessário.
## Compatibilidade com iOS/iPadOS/macOS Safari

- Viewport e Safe Area:
  - `index.html` usa `viewport-fit=cover` e adiciona classe `is-pwa` quando instalado.
  - `src/index.css` utiliza `100svh/100dvh` com fallback `-webkit-fill-available` e `env(safe-area-inset-*)`.
- PWA/Service Worker:
  - O Service Worker é registrado também fora do modo PWA para melhorar cache em Safari.
  - Botão de emergência para limpar caches/Storage caso o app não carregue em 15s.
- Upload de Fotos (Câmera iOS):
  - Inputs usam `accept="image/*"` e `capture="environment"` quando iOS/Safari.
- Notificações Push:
  - Push Web é suportado apenas no iOS ≥ 16.4 (Safari). A UI protege cenários sem suporte.
  - Em ambientes sem HTTPS (exceto `localhost`), push é desabilitado.

### Dicas de Instalação em iOS
- iPhone/iPad: abrir no Safari, tocar em Compartilhar → "Adicionar à Tela de Início".
- Em modo instalado (standalone), o app usa `safe-area` e viewport corretos.
