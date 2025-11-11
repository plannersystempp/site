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
