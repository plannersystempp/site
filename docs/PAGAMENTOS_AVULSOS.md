# Pagamentos Avulsos — Filtros e Relatório

## Filtros
- Período: `Data inicial` e `Data final` (filtram por `payment_due_date`).
- Status: `Pendente`, `Pago`, `Cancelado`.
- Botão "Limpar filtros" restaura o estado.

## Relatório Detalhado
- Botão "Gerar Relatório" imprime a seção com:
  - Filtros aplicados visíveis.
  - Tabela com Beneficiário, Método, Vencimento, Valor e Status.
  - Soma total dos valores no rodapé.
  - Indicação da página atual.

## Paginação
- Controles "Anterior" e "Próxima" no fim da lista.
- Tamanho da página padrão: 20 itens.

## Acessibilidade e Responsividade
- Labels visíveis para todos os campos.
- Layout em grid responsivo (1–3 colunas).

## Permissões
- A funcionalidade respeita o time ativo e a seleção de equipe; apenas usuários com acesso ao módulo de Pagamentos Avulsos visualizam e executam ações.

## Localização
- Página: `Pagamentos Avulsos` em `/app/pagamentos-avulsos`.