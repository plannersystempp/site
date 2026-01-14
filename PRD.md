# PRD - PlannerSystem Site

## 1. Visão Geral do Produto

O PlannerSystem é uma plataforma completa de gestão de eventos que oferece soluções integradas para controle de pessoal, gestão financeira, lançamento de horas, folha de pagamento, estimativa de custos e relatórios inteligentes. O site apresenta as funcionalidades do sistema SaaS para potenciais clientes, com foco em empresas de eventos e produção.

**Problema resolvido:** Simplifica a gestão complexa de eventos, unificando controle de equipe, finanças e operações em uma única plataforma.
**Público-alvo:** Empresas de eventos, produtoras, agências de staffing e organizadores de eventos corporativos.
**Valor entregue:** Redução de custos operacionais, aumento da eficiência na gestão de pessoal e maior controle financeiro dos eventos.

## 2. Stack Tecnológica Detectada

- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS 3.4
- **Roteamento:** React Router DOM v7
- **Gerenciamento de Estado:** Zustand v5
- **Ícones:** Lucide React
- **SEO:** React Helmet Async
- **Build Tool:** Vite 6
- **Linter:** ESLint 9 + TypeScript ESLint
- **PWA:** Service Worker implementado

## 3. Funcionalidades/Páginas Existentes

### Páginas Principais:
1. **Landing Page** (`/`) - Homepage com hero section, grid de soluções, depoimentos e estatísticas
2. **Sobre** (`/sobre`) - Informações sobre a empresa
3. **Termos de Uso** (`/termos-de-uso`) - Termos legais do serviço
4. **Política de Privacidade** (`/privacidade`) - Política de privacidade GDPR

### Páginas de Soluções:
1. **Gestão de Eventos** (`/solucoes/gestao-eventos`) - Gestão completa de eventos
2. **Controle de Pessoal** (`/solucoes/controle-pessoal`) - Cadastro e gestão de funcionários fixos e freelancers
3. **Lançamento de Horas** (`/solucoes/lancamento-horas`) - Controle de ponto e horas trabalhadas
4. **Folha de Pagamento** (`/solucoes/folha-pagamento`) - Gestão de pagamentos e folha
5. **Estimativa de Custos** (`/solucoes/estimativa-custos`) - Orçamento e estimativa financeira
6. **Relatórios Inteligentes** (`/solucoes/relatorios-inteligentes`) - Analytics e relatórios customizados

## 4. Estrutura do Projeto

```
src/
├── components/           # Componentes React reutilizáveis
│   ├── Modals/          # Modais de planos e contato
│   ├── previews/        # Prévias das funcionalidades
│   ├── solutions/       # Componentes específicos de soluções
│   ├── BentoGrid.tsx    # Grid de soluções na homepage
│   ├── Footer.tsx       # Rodapé
│   ├── HeroSection.tsx  # Seção hero da homepage
│   ├── Navbar.tsx       # Navegação principal
│   └── ...
├── hooks/               # Hooks customizados
├── pages/              # Páginas do site
│   ├── solutions/       # Páginas de soluções
│   ├── About.tsx        # Página sobre
│   ├── Landing.tsx      # Homepage
│   └── ...
├── App.tsx             # Configuração de rotas principal
└── main.tsx            # Entry point
```

## 5. Regras de Negócio Implícitas

### Sistema de Planos:
- Modal de planos acessível via navbar e CTA buttons
- Integração com Stripe para pagamentos (baseado nas functions do Supabase)
- Diferentes níveis de assinatura (provavelmente Free, Pro, Enterprise)

### Gestão de Usuários:
- Suporte a múltiplos papéis (Admin, Coordenador, Financeiro, etc.)
- Sistema de permissões por módulo
- Gestão de equipes e sub-contas

### Controle de Pessoal:
- Cadastro de funcionários fixos e freelancers
- Definição de funções e especialidades
- Histórico completo de trabalhos e pagamentos
- Alocação por divisão/setor

### Gestão Financeira:
- Controle de pagamentos e folha
- Emissão de relatórios financeiros
- Integração com PIX (baseado na function pix-key)
- Gestão de fornecedores e custos

### Analytics e Relatórios:
- Dashboard com KPIs principais
- Relatórios customizáveis
- Exportação de dados
- Analytics em tempo real

### Notificações:
- Sistema de notificações push (baseado na function send-push-notification)
- Alertas de pagamentos e prazos
- Comunicação interna entre equipe

### Conformidade:
- LGPD/GDPR compliance (política de privacidade detalhada)
- Logs de auditoria (baseado na function cleanup-old-logs)
- Backup automático do banco de dados

### Performance:
- Implementação PWA com service worker
- Otimização para mobile e desktop
- Lazy loading de componentes
- Cache de assets estáticos