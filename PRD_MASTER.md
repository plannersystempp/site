# PRD MASTER - PlannerSystem Site
> Fonte Única da Verdade (SSOT) - Atualizado em 11/02/2026

## 1. Visão Geral do Produto

O PlannerSystem é uma plataforma completa de gestão de eventos que oferece soluções integradas para controle de pessoal, gestão financeira, folha de pagamento, estimativa de custos e relatórios inteligentes. O site apresenta as funcionalidades do sistema SaaS para potenciais clientes, com foco em empresas de eventos e produção.

**Problema resolvido:** Simplifica a gestão complexa de pessoal em eventos, unificando controle de equipe, finanças e operações em uma única plataforma.
**Público-alvo:** Empresas de eventos, produtoras, agências de staffing e organizadores de eventos.
**Valor entregue:** Redução de custos operacionais, aumento da eficiência na gestão de pessoal e maior controle financeiro dos eventos.

## 2. Stack Tecnológica (Atualizado)

* **Framework:** Next.js 16.1.2 (App Router)
* **Linguagem:** TypeScript 5.x
* **Estilização:** Tailwind CSS 3.4
* **Gerenciamento de Estado:** Zustand v5
* **Ícones:** Lucide React
* **SEO:** Metadata API (Next.js) + JSON-LD Schema
* **Build Tool:** Turbopack (Next.js)
* **Linter:** ESLint 9 + TypeScript ESLint

## 3. Funcionalidades/Páginas

### Páginas Principais:
1. **Landing Page** (`/`) - Homepage com hero section, grid de soluções, depoimentos e estatísticas
2. **Sobre** (`/sobre`) - Informações sobre a empresa
3. **Termos de Uso** (`/termos-de-uso`) - Termos legais do serviço
4. **Política de Privacidade** (`/privacidade`) - Política de privacidade GDPR

### Páginas de Soluções:
1. **Gestão de Eventos** (`/solucoes/gestao-eventos`) - Gestão completa de eventos
2. **Controle de Pessoal** (`/solucoes/controle-pessoal`) - Cadastro e gestão de funcionários fixos e freelancers
3. **Folha de Pagamento** (`/solucoes/folha-pagamento`) - Gestão de pagamentos e folha
4. **Estimativa de Custos** (`/solucoes/estimativa-custos`) - Orçamento e estimativa financeira
5. **Relatórios Inteligentes** (`/solucoes/relatorios-inteligentes`) - Analytics e relatórios customizados

## 4. Estrutura do Projeto (Refatorada para SEO)

```
src/
├── app/                    # Rotas (Next.js App Router)
│   ├── layout.tsx          # Layout Root (SEO Global + Fontes)
│   ├── page.tsx            # Home (usa src/conteudos/Landing)
│   ├── sobre/              # Rota /sobre
│   ├── solucoes/           # Rotas /solucoes/*
│   ├── robots.ts           # Robots.txt dinâmico
│   └── sitemap.ts          # Sitemap.xml dinâmico
├── components/             # Componentes UI reutilizáveis (Client Components)
│   ├── Modals/             # Modais (Contato, Planos)
│   ├── solutions/          # UI específica das páginas de solução
│   └── ...
├── conteudos/              # Páginas lógicas (extraídas de src/pages para evitar rotas duplicadas)
│   ├── Landing.tsx
│   ├── About.tsx
│   ├── solutions/          # Conteúdo das soluções
│   └── ...
├── lib/
│   └── seo.ts              # Utilitários de SEO (Metadata Generator)
└── store/                  # Estado global (Zustand)
```

## 5. Log de Mudanças (Changelog)

### [2026-02-11] - SEO Architecture Upgrade
- **Migração de Estrutura:**
  - Removido `src/pages` para evitar conflito de rotas com App Router e conteúdo duplicado.
  - Criado `src/conteudos` para abrigar a lógica das páginas, importadas por `src/app`.
- **SEO Técnico:**
  - Implementado `src/lib/seo.ts` com `criarMetadataPagina` para padronização.
  - Adicionado suporte a Canonical Tags automáticas.
  - Adicionado JSON-LD (Schema.org) para `WebSite` e `Organization` no root layout.
  - Adicionado OpenGraph e Twitter Cards padrão.
- **Robots & Sitemap:**
  - Substituídos arquivos estáticos em `public/` por rotas dinâmicas (`robots.ts` e `sitemap.ts`) que respeitam a URL base do ambiente.
- **Acessibilidade & Performance:**
  - Adicionado `sizes` em imagens Next/Image.
  - Melhorado `aria-label` e foco em Modais e Widgets flutuantes.
  - Removido `vercel.json` com rewrites perigosos (SPA-mode) que quebravam SEO server-side.
