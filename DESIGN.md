---
name: Solução Já Admin
description: Painel administrativo corporativo limpo, moderno e agradável baseado em TailwindUI.
colors:
  primary: "#ea580c"
  primary-hover: "#c2410c"
  primary-light: "#fff7ed"
  primary-dark: "#9a3412"
  accent: "#854d0e"
  accent-light: "#fef9c3"
  neutral-bg: "#ffffff"
  neutral-surface: "#fafafa"
  neutral-border: "#e5e5e5"
  ink-text: "#262626"
  ink-muted: "#737373"
typography:
  display:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
  button-secondary:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
---

# Design System: Solução Já Admin

## 1. Overview

**Creative North Star: "The Clean Curator"**

O design de interface do painel administrativo do Solução Já busca transmitir a sobriedade operacional e o profissionalismo exigido de uma plataforma de intermediação local. Por ser uma ferramenta intensiva focada no gerenciamento, a densidade visual prioriza a legibilidade de longa duração e o conforto visual. O design adota o estilo corporativo limpo inspirado em TailwindUI e Vercel, caracterizado por fundos claros, tipografia refinada e espaçamento balanceado.

### Key Characteristics:
* **Foco no Conteúdo**: Livre de artefatos visuais chamativos e decorações, a informação é a protagonista.
* **Espaço Negativo Ativo**: Distribuição ampla para evitar sensação de saturação no gerenciamento diário.
* **Fidelidade de Estado**: O uso de cores reflete diretamente o estado semântico de cada profissional ou transação na ferramenta.

## 2. Colors

O painel utiliza uma paleta de cores baseada em matizes quentes de laranja de Cariacica como acento principal, assentado sobre neutros claros baseados no espaço de cor OKLCH.

### Primary
- **Terracotta Orange** (oklch(0.62 0.19 49) / #ea580c): Utilizada exclusivamente em botões de ação primários, badges de destaque e links de navegação ativa. A raridade de uso é o segredo do seu impacto.

### Secondary
- **Warm Bronze** (oklch(0.48 0.16 28) / #854d0e): Acento secundário para elementos de advertência e distinção.

### Neutral
- **Clean White** (#ffffff): O fundo das views e áreas principais da aplicação.
- **Canvas Gray** (oklch(0.975 0 0) / #fafafa): Fundo sutil do corpo e containers inativos.
- **Separator Gray** (oklch(0.905 0 0) / #e5e5e5): Bordas elegantes e elementos de separação.
- **Ink Text** (oklch(0.18 0.008 49) / #262626): Texto principal de alto contraste e legibilidade.

### Named Rules
**The One Accent Rule.** A cor laranja primária da marca deve preencher menos de 10% do espaço de tela.

## 3. Typography

**Display Font:** DM Sans, system-ui, sans-serif
**Body Font:** DM Sans, system-ui, sans-serif

A fonte DM Sans é o pilar estrutural do painel, garantindo que números e nomes sejam rapidamente escaneáveis sem causar fadiga ocular.

### Hierarchy
- **Display** (Bold (700), 1.875rem (30px), 1.2): Cabeçalhos principais e títulos de telas principais.
- **Headline** (Bold (700), 1.25rem (20px), 1.3): Títulos de seções, modais e containers internos.
- **Title** (Semibold (600), 1rem (16px), 1.4): Títulos de categorias, cabeçalhos de tabela.
- **Body** (Regular (400), 0.875rem (14px), 1.6): Linhas de dados, descrições e formulários.
- **Label** (Semibold (600), 0.75rem (12px), 1.0): Legendas, metadados e badges informativos.

## 4. Elevation

O sistema utiliza elevação sutil baseada em camadas (tonais e de borda) e recorta as sombras apenas para destacar modais e interações dinâmicas importantes.

### Shadow Vocabulary
- **ambient-low** (0 1px 3px rgba(38,38,38,0.08)): Sombras pequenas em botões.
- **ambient-mid** (0 4px 8px rgba(38,38,38,0.10)): Sombras suaves em menus suspensos e modais.

### Named Rules
**The Flat-By-Default Rule.** Superfícies e tabelas de dados não possuem sombras decorativas de repouso. A profundidade é dada unicamente pelas cores do background e pelas bordas sutis.

## 5. Components

### Buttons
- **Shape:** Cantos levemente arredondados (8px / radius-md).
- **Primary:** Fundo laranja (#ea580c), texto branco, padding de 10px 16px.
- **Hover / Focus:** Transição suave para tom mais escuro (#c2410c) acompanhado de outline-offset de foco ativo.

### Cards / Containers
- **Corner Style:** 12px (radius-lg) para contornos de seções.
- **Background:** Puro branco (#ffffff).
- **Border:** Separador de 1.5px (var(--color-border)).
- **Internal Padding:** Mínimo de 20px (1.25rem).

### Inputs / Fields
- **Style:** Fundo branco, borda separadora de 1.5px (var(--color-border)), cantos de 8px (radius-md).
- **Focus:** Borda primaria orange com glow suave.

### Navigation
- **Style:** Barra superior ou lateral limpa com link ativo destacado por cor terracotta (#ea580c).

## 6. Do's and Don'ts

### Do:
- **Do** manter espaçamento de no mínimo 12px vertical nas linhas de tabelas para manter dados arejados.
- **Do** utilizar badges de cores consistentes para denotar o status do profissional (ex: Verde para Ativo, Amarelo para Pendente, Vermelho para Rejeitado).
- **Do** usar a fonte DM Sans em pesos consistentes (Regular, Semibold, Bold) como a única família para manter a coesão.

### Don't:
- **Don't** utilizar side-stripe borders coloridas como acento decorativo em cards ou tabelas.
- **Don't** usar degradê de cores no background ou gradiente de cores nos textos.
- **Don't** usar glassmorphism em modais ou componentes de cabeçalho.
- **Don't** colocar borda e box-shadow de alta difusão no mesmo elemento.
