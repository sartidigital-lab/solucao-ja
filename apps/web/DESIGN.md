# Design System — Solução Já (apps/web)

## Theme

**Mode:** Light — fundo branco puro. O coral do brand faz todo o trabalho emocional; o fundo é neutro para não brigar.

**Cena física:** Moradora de Vila Velha, 10h da manhã, luz natural, celular na mão, torneira pingando — precisa de um encanador agora. Interface sob luz direta de tela brilhante.

**Estratégia de cor:** Committed — o coral âmbar carrega 30–50% da superfície em momentos de ação e destaque.

---

## Color Palette (OKLCH)

```css
/* Brand */
--color-primary:   oklch(0.62 0.19 49);   /* coral âmbar — botões, CTAs, ícones ativos */
--color-primary-hover: oklch(0.55 0.20 47); /* coral mais escuro no hover */
--color-primary-light: oklch(0.95 0.04 49); /* tint suave para fundos de badge/chip */
--color-primary-dark:  oklch(0.42 0.17 46); /* para texto sobre fundo claro, links */

--color-accent:    oklch(0.48 0.16 28);   /* terracota queimado — urgência, "Preciso Agora", erros críticos */
--color-accent-light: oklch(0.95 0.04 28); /* tint terracota para fundos */

/* Surface */
--color-bg:        oklch(1.000 0.000 0);  /* branco puro — fundo da aplicação */
--color-surface:   oklch(0.975 0.000 0);  /* off-white puro — cards, painéis, inputs */
--color-surface-2: oklch(0.955 0.000 0);  /* camada mais profunda — hover de item, dividers */
--color-border:    oklch(0.90 0.000 0);   /* bordas sutis */
--color-border-strong: oklch(0.80 0.000 0); /* bordas visíveis */

/* Ink */
--color-ink:       oklch(0.18 0.008 49);  /* quase preto levemente aquecido — texto principal */
--color-muted:     oklch(0.48 0.005 49);  /* texto secundário, placeholders */
--color-subtle:    oklch(0.68 0.004 49);  /* texto terciário, disabled */

/* Semantic */
--color-success:   oklch(0.52 0.15 145);  /* verde escuro — confirmado, concluído */
--color-success-light: oklch(0.95 0.04 145);
--color-warning:   oklch(0.68 0.16 85);   /* âmbar — pendente, aguardando */
--color-warning-light: oklch(0.97 0.03 85);
--color-error:     oklch(0.52 0.20 28);   /* terracota — erro, cancelado */
--color-error-light: oklch(0.96 0.04 28);
--color-info:      oklch(0.52 0.12 245);  /* azul índigo — informação, perfil verificado */
--color-info-light: oklch(0.95 0.03 245);
```

---

## Typography

**Família:** [Geist](https://vercel.com/font) (Geist Sans) — substituir Inter. Geist é neutro, sem carga histórica de SaaS americano, legível em densidades altas, humanista o suficiente para não parecer frio.

> Alternativa aceitável se Geist não disponível: DM Sans (Google Fonts)

**Hierarquia (escala fixa — product UI, não fluid):**

```
--text-xs:   0.75rem  / 1.0rem  (12px) — labels, captions, meta
--text-sm:   0.875rem / 1.25rem (14px) — body secundário, botões pequenos
--text-base: 1rem     / 1.5rem  (16px) — body principal
--text-lg:   1.125rem / 1.5rem  (18px) — subtítulos de seção
--text-xl:   1.25rem  / 1.5rem  (20px) — títulos de card, headings menores
--text-2xl:  1.5rem   / 1.25rem (24px) — títulos de página
--text-3xl:  1.875rem / 1.2rem  (30px) — hero heading (mobile)
--text-4xl:  2.25rem  / 1.15rem (36px) — hero heading (desktop)
```

**Regras:**
- `text-wrap: balance` em h1–h3.
- `letter-spacing: -0.02em` só em headings display (3xl+). Nunca abaixo de -0.04em.
- Peso: 400 (body), 500 (labels/botões), 600 (subtítulos), 700 (headings principais).
- Linha máxima para prose: 68ch.

---

## Shape (Border Radius)

```
--radius-sm:  4px   — inputs, tags compactas
--radius-md:  8px   — botões, chips, badges
--radius-lg:  12px  — cards, modais, popovers
--radius-xl:  16px  — cards highlight, banners
--radius-full: 9999px — pills, avatares
```

Sem extreme rounding (≥24px) em cards ou seções.

---

## Spacing Scale

Base 4px (0.25rem). Variações: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

---

## Shadows

```
--shadow-sm:  0 1px 3px oklch(0.18 0.008 49 / 0.08);
--shadow-md:  0 4px 8px oklch(0.18 0.008 49 / 0.10);
--shadow-lg:  0 8px 16px oklch(0.18 0.008 49 / 0.12);
```

Máximo 8px de blur para sombras de card. Nunca pair `border + shadow-lg` no mesmo elemento.

---

## Component Vocabulary

### Botão Primário
- Background: `--color-primary`
- Texto: branco puro
- Radius: `--radius-md`
- Padding: 12px 20px (base), 14px 24px (lg)
- Hover: `--color-primary-hover` + shadow-sm
- Loading: spinner inline, texto some
- Disabled: opacity 0.4, cursor not-allowed

### Botão Secundário
- Background: `--color-surface`
- Borda: `--color-border-strong`
- Texto: `--color-ink`
- Hover: `--color-surface-2`

### Botão Destaque (Urgência)
- Background: `--color-accent`
- Texto: branco
- Usado SOMENTE para "Preciso Agora" e ações irreversíveis críticas

### Input / Select
- Background: `--color-bg`
- Borda: `--color-border`
- Focus: borda `--color-primary`, sem outline padrão
- Placeholder: `--color-subtle`
- Erro: borda `--color-error`, mensagem em `--color-error`

### Cards de Profissional
- Background: `--color-bg`
- Borda: 1px `--color-border`
- Radius: `--radius-lg`
- Hover: borda `--color-primary` + shadow-sm
- SEM border+shadow combinados como decoração

### Badge / Chip
- Radius: `--radius-full`
- Variantes: primary (coral-light bg, coral text), success, warning, error, muted
- Tamanho mínimo para toque: 32px altura

### Avatar
- Radius: `--radius-full`
- Placeholder: iniciais em `--color-primary` bg light

---

## Motion

- Duração padrão: 150ms (interações rápidas), 200ms (transições de estado), 250ms (modais/overlays)
- Curva: cubic-bezier(0.16, 1, 0.3, 1) — ease-out-expo
- Sem orquestração de entrada de página
- `@media (prefers-reduced-motion: reduce)`: crossfade instant (transition: opacity 0ms)
- Estados ativos e hover: transform scale(0.98) em botões no active

---

## Z-index Scale

```
--z-dropdown:  100
--z-sticky:    200
--z-overlay:   300
--z-modal:     400
--z-toast:     500
--z-tooltip:   600
```

---

## Layout

- Container max: 1200px com padding lateral 16px (mobile) / 24px (tablet) / 32px (desktop)
- Grid de cards: `repeat(auto-fit, minmax(280px, 1fr))`
- Header sticky: 64px altura
- Bottom nav mobile: 64px altura, fixed
- Side nav profissional: 240px (desktop), off-canvas (mobile)

---

## Anti-patterns proibidos neste projeto

- `bg-clip: text` com gradient — absolutamente proibido
- Gradient text de qualquer tipo
- Cards com `border-radius ≥ 24px`
- Glassmorphism decorativo
- `border + box-shadow ≥ 16px` no mesmo elemento
- `slate-900/slate-950` como fundo de superfície de produto
- Gradients decorativos em backgrounds de seção
- Texto cinza (`text-slate-400`) sobre fundos coloridos
