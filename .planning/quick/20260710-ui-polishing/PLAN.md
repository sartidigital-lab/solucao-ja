---
title: Polimento de UI/UX e Acessibilidade (PWA Web)
slug: ui-polishing
status: complete
date: 2026-07-10
---

# Plano: Polimento de UI/UX e Acessibilidade (PWA Web)

Executar os ajustes visuais sequenciais de acordo com a crítica visual:
1. **Tipografia (Typeset)**: Remover fontes inferiores a 12px no "Preciso Agora" e rodapé.
2. **Cores (Colorize)**: Mapear e parametrizar cores semânticas customizadas no globals.css.
3. **GPS Onboarding (Onboard)**: Melhorar a visibilidade do seletor manual e exibir feedback do status de permissão de geolocalização no DiscoveryClient.tsx.

## Passos

- [x] Substituir classes de fontes menores de 12px (text-[9px], text-[10px], fontSize 0.8125rem) por classes de type ramp padrão (--text-xs e --text-sm).
- [x] Organizar e parametrizar as cores de opacidade semânticas em apps/web/app/globals.css.
- [x] Atualizar o DiscoveryClient.tsx para exibir feedback quando o GPS estiver obtendo dados e tornar o seletor manual de bairro mais proeminente se a geolocalização falhar.
- [x] Validar a build de produção e rodar o detector estático para confirmar 0 desvios críticos.
