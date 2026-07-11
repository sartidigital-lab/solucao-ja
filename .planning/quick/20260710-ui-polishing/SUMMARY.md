---
status: complete
date: 2026-07-10
---

# Resumo: Polimento de UI/UX e Acessibilidade (PWA Web)

Realizamos melhorias de usabilidade e acessibilidade nas telas de busca e descoberta pública do PWA (apps/web):
- **Tipografia (Typeset)**: Removemos todas as ocorrências de fontes inferiores ao limite do Design System (9px e 10px) no "Preciso Agora" ([PrecisoAgoraClient.tsx](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/apps/web/app/preciso-agora/PrecisoAgoraClient.tsx) e [page.tsx](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/apps/web/app/preciso-agora/page.tsx)), na busca ([BuscaClient.tsx](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/apps/web/app/busca/BuscaClient.tsx) e [busca/page.tsx](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/apps/web/app/busca/page.tsx)) e no rodapé da Home ([page.tsx](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/apps/web/app/page.tsx)). Padronizamos todas para a variável CSS `--text-xs (12px)`.
- **Cores (Colorize)**: Mapeamos as opacidades e cores ad-hoc no [globals.css](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/apps/web/app/globals.css) para variáveis semânticas globais no theme (como `--color-success-border`, `--color-error-focus`, `--color-ink-light`), evitando drift visual.
- **GPS Onboarding (Onboard)**: Refatoramos o [DiscoveryClient.tsx](file:///c:/Users/User/OneDrive/Área de Trabalho/Solução Já/apps/web/app/DiscoveryClient.tsx) para exibir um indicador animado de geolocalização em andamento e destacar visualmente o seletor manual com pulsação e borda primária quando a geolocalização automática falhar, fornecendo um botão direto de ação rápida.
- **Validação**: Build do Turborepo concluída com 100% de sucesso e detector estático retornando zero desvios de design slop nas páginas tratadas.
