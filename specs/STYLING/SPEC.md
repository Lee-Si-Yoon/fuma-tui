# SPEC: Styling

## Goal

Terminal/TUI aesthetic. Monospace-forward, sharp corners, pixelated fonts, scanline overlay, custom cursors. Supports light/dark/system themes.

## Approach

Fumadocs UI with CSS-only overrides. No WebTUI (removed). Fumadocs design tokens remapped to a blue-accent palette.

## Theme system

`next-themes` via Fumadocs `RootProvider`. Three modes: `light`, `dark`, `system`.

```tsx
// app/layout.tsx
<RootProvider
  theme={{
    enableSystem: true,
    defaultTheme: "system",
    themes: ["light", "dark"],
  }}
>
```

Theme toggle in sidebar via `DocsLayout` `themeSwitch={{ enabled: true, mode: "light-dark-system" }}`.

## Accent color

Base accent: `#0095ff`.

| Theme | Tint | Background | Sidebar BG |
|-------|------|------------|------------|
| dark | `#0095ff` | `#121620` | `#0d1018` |
| light | `#3b9eff` | `#ffffff` | `#f5f6f9` |

## CSS architecture

`app/global.css`:

```css
@import "tailwindcss";
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/preset.css";
@import "katex/dist/katex.min.css";
@import "fumadocs-obsidian/css/preset.css";
```

CSS variables defined per theme via `.dark` and `.light` class selectors:

- `--accent` / `--accent-dim` / `--accent-muted` (base, theme-independent)
- `--terminal-fg` / `--terminal-fg-dim` / `--terminal-fg-muted` / `--terminal-border-dashed` / `--terminal-border-solid` (per-theme)
- `--color-fd-*` (Fumadocs tokens, per-theme)
- `--prose-fg` / `--prose-bg-code` / `--prose-bg-pre` (content area, per-theme)
- `--sidebar-bg` / `--scrollbar-track` / `--scrollbar-thumb` / `--scrollbar-thumb-hover` (per-theme)

## Fonts

- **Pixel font**: VT323 (via `next/font/google`, `--font-pixel`). Used for headings, h1 prefix, table headers, decrypted text.
- **Monospace**: JetBrains Mono (`--font-mono`). Used for body text, code, sidebar, frontmatter.
- Default font family: `--font-mono`.
- Headings use `--font-pixel` with `font-weight: 400` and letter-spacing.
- `image-rendering: pixelated` on img/canvas/svg.

## Global visual effects

### TUI Cursor

Custom SVG cursors (`public/cursor-plus.svg`, `cursor-text.svg`, plus light variants). Controlled via CSS custom properties `--cursor-default`, `--cursor-pointer`, `--cursor-text` (set in `:root` for dark, overridden in `.light`):
- Default: `cursor-plus.svg` (plus/sign cursor)
- Links/buttons: same cursor with `pointer` fallback
- Text inputs: `cursor-text.svg` with `text` fallback
- `caret-color: var(--terminal-fg)` on inputs

### CRT Scanline overlay

`body::before` pseudo-element: fixed full-screen, `z-index: 9999`, `pointer-events: none`:
- Light: `rgba(0,0,0,0.03)` 50% scanlines
- Dark: `rgba(0,149,255,0.06)` 50% scanlines

### Zero rounding

Global `* { border-radius: 0 !important }` on all elements. `:root { --radius: 0 }`. No per-element `border-radius: 0` declarations needed.

### Selection

`::selection` uses `--terminal-fg` background with `--color-fd-primary-foreground` text.

## Layout overrides

Full-width content, no TOC, sidebar pinned to left edge, content fills to right edge:

```css
#nd-page {
  max-width: none !important;
  margin-inline: 0 !important;
}

#nd-toc-placeholder {
  display: none !important;
}

/* Override Fumadocs 5-column grid:
   [left-spacer] [sidebar] [main(1fr)] [toc] [right-spacer]
   left-spacer=0  → sidebar starts at x=0
   main=1fr        → content fills remaining width (no max-width cap)
   toc=0            → TOC column removed
   right-spacer=0   → content reaches right edge */
#nd-docs-layout {
  --fd-toc-width: 0px !important;
  grid-template-columns: 0 var(--fd-sidebar-col) minmax(0, 1fr) 0 0 !important;
}

/* Extra left padding on content for sidebar gap (desktop only) */
@media (min-width: 768px) {
  #nd-page {
    padding-left: 2.5rem;
  }
}
```

## Prose styling

- **Headings**: `--font-pixel`, `> ` prefix on h1 (terminal prompt style)
- **Links**: `--terminal-fg` color, dashed bottom border on hover. Internal wikilinks (`/docs/`) have transparent border by default. External links get `↗` suffix via `::after`.
- **Code**: inline code with `--prose-bg-code` background. `pre` blocks with 2px solid border, `--prose-bg-pre` background.
- **Blockquote**: 2px solid left border, `--prose-bg-code` background
- **Tables**: `--font-mono` body, `--font-pixel` headers, dashed cell borders
- **Lists**: custom markers — unordered uses `-` prefix, ordered uses `[N]` counter
- **HR**: dashed top border
- **Cards** (`.fd-card`): 2px solid border, hover changes border to `--terminal-fg`
- **Buttons** (`button[class*="fd"]`): zero radius, monospace

## Fluid type scale (Utopia)

[Utopia](https://utopia.fyi/) approach: `clamp()` instead of breakpoints for fluid responsive type. Viewport range: 320px–1400px.

Formula: `clamp(min, preferred, max)` where `preferred = intercept + slope * vw`.

| Element | clamp() | 320px | 1400px+ |
|---------|---------|-------|---------|
| `.prose h1` | `clamp(1.75rem, 1.45rem + 1.48vw, 2.75rem)` | 1.75rem (28px) | 2.75rem (44px) |
| `.prose h2` | `clamp(1.38rem, 1.19rem + 0.93vw, 2rem)` | 1.38rem (22px) | 2rem (32px) |
| `.prose h3` | `clamp(1.12rem, 1.01rem + 0.56vw, 1.5rem)` | 1.12rem (18px) | 1.5rem (24px) |
| `.prose th` | `clamp(0.94rem, 0.88rem + 0.28vw, 1.12rem)` | 0.94rem (15px) | 1.12rem (18px) |

### Breakpoint → fluid replacements

| Location | Before | After |
|----------|--------|-------|
| README title (`page.tsx`) | `text-6xl sm:text-7xl md:text-9xl` (3 breakpoints) | `text-[clamp(3.75rem,1rem+8vw,8rem)]` |
| GraphView height (`graph-view.tsx`) | `h-[60dvh] md:h-[800px]` (2 breakpoints) | `h-[min(60dvh,50rem)]` |

### Limitations

Fumadocs internal layout (sidebar width, TOC width, content max-width, padding) uses Tailwind v4 `@media` breakpoints and hardcoded utility classes. These cannot be overriden with `clamp()` without patching Fumadocs source. Fluid scaling is only applied to custom CSS in `app/global.css` and component classNames.

## Sidebar

- Dashed right border, `--sidebar-bg` background
- Logo centered vertically (margin-bottom override on brand row)
- Collapsed panel moved to top-right (`inset-inline-end: 1rem`, `top: 1rem`) to avoid breadcrumb overlap
- Search bar: 2px solid border, monospace, `--terminal-fg` border on focus
- Focus outlines: 1px dashed `--terminal-fg`, 2px offset

## Custom components

### PixelBlast (`components/react-bits/pixel-blast.tsx`)

Three.js + postprocessing Bayer-dithered pixel shader background.

Custom props: `variant`, `pixelSize`, `color`, `patternScale`, `patternDensity`, `pixelSizeJitter`, `enableRipples`, `rippleSpeed`, `rippleThickness`, `rippleIntensityScale`, `liquid`, `liquidStrength`, `liquidRadius`, `liquidWobbleSpeed`, `speed`, `edgeFade`, `noiseAmount`, `transparent`.

Shader uniforms: `uColor` (vec3), `uResolution` (vec2), `uTime` (float), `uPixelSize` (float), `uScale` (float), `uDensity` (float), `uEnableRipples` (int), `uRippleSpeed`, `uRippleThickness`, `uRippleIntensity`, `uEdgeFade`, `uShapeType` (int), `uClickPos[]` (vec2 array), `uClickTimes[]` (float array).

### ThemedPixelBlast (`components/themed-pixel-blast.tsx`)

Client wrapper that reads `resolvedTheme` from `next-themes` and passes theme-appropriate pixel `color`:

| Theme | darkColor | lightColor |
|-------|-----------|------------|
| dark | `#ffffff` | — |
| light | — | `#2A62DB` |

Also renders a centered brand logo (inline SVG from `public/f.svg` paths) recolored per theme: white in dark mode, brand `#2A62DB` in light mode.

### DecryptedText (`components/react-bits/decrypted-text.tsx`)

Motion-based text decrypt animation (React Bits).

### ThemedDecryptedText (`components/themed-decrypted-text.tsx`)

Client wrapper that reads `resolvedTheme` from `next-themes` and passes theme-appropriate revealed/encrypted colors:

| Theme | revealedColor | encryptedColor |
|-------|---------------|----------------|
| dark | `#89b4fa` | `rgba(137,180,250,0.4)` |
| light | `#0095ff` | `rgba(0,149,255,0.4)` |

Used on the README page with `animateOn="inViewHover"`, `sequential`, `revealDirection="start"`.

### ClickSpark — DELETED

The standalone `components/react-bits/click-spark.tsx` was removed. `ThemedClickSpark` reimplements the spark animation inline with theme support. No importers remain.

### ThemedClickSpark (`components/themed-click-spark.tsx`)

Global click-spark overlay. Renders a fixed full-viewport `<canvas>` with `pointer-events: none` and `z-index: 9999`. Listens for clicks on `document` so sparks appear anywhere on the page. Spark color follows the active theme via `next-themes`:

| Theme | sparkColor |
|-------|------------|
| dark | `#0095ff` |
| light | `#0066cc` |

Uses `colorRef` (mutable ref) so the rAF loop picks up theme changes without restarting. Mounted once in `app/layout.tsx` inside `RootProvider`.

### BorderGlow (`components/react-bits/border-glow.tsx`)

Interactive border glow card (React Bits). Pointer-tracked conic-gradient border with mesh-gradient fill and outer box-shadow glow. Props: `edgeSensitivity`, `glowColor` (HSL "H S L"), `backgroundColor`, `borderRadius`, `glowRadius`, `glowIntensity`, `coneSpread`, `animated`, `colors` (3-hex mesh gradient), `fillOpacity`, `children`, `className`.

### ThemedBorderGlow (`components/themed-border-glow.tsx`)

Theme-aware wrapper around `BorderGlow`. Uses `next-themes` `resolvedTheme` with `mounted` guard to switch glow color, background, and mesh gradient colors per theme. Defaults:

| Theme | glowColor | colors | backgroundColor |
|-------|-----------|--------|-----------------|
| dark | `210 100% 50%` | `#3b9eff`, `#2563eb`, `#0ea5e9` | `#1e2433` (`--color-fd-secondary`) |
| light | `210 100% 40%` | `#3b9eff`, `#2563eb`, `#0ea5e9` | `#e5e8ee` (`--color-fd-secondary`) |

### SidebarFooter (`components/sidebar-footer.tsx`)

Client component rendered as `sidebar.footer` in `DocsLayout`. Wraps a promotional link inside `ThemedBorderGlow` (borderRadius 12, glowRadius 20, glowIntensity 0.8, edgeSensitivity 20, coneSpread 20). Link points to `#` (placeholder). Text: "Interested in contributing?" / "Click here to get started →".

### TemplateLogo (`components/friendli-logo.tsx`)

Inline SVG component rendering the default template wordmark. Uses `fill="currentColor"` so it inherits text color (`--terminal-fg`). Rendered in the sidebar nav title at `h-[2rem]`. Override by replacing `public/logo.svg` and setting `siteConfig.logo.src`.

### FrontmatterMeta (`components/frontmatter-meta.tsx`)

Renders frontmatter as a visible YAML block with dashed border (`.fd-frontmatter`). See CONTENT spec for details.

### GraphView (`components/graph-view.tsx`)

Interactive `react-force-graph-2d` canvas with d3-force simulation. See CONTENT spec for graph data. Visual features:

- **Node rendering**: circle (r=5) with text label below (14px). Active/hovered nodes and neighbors use `--color-fd-primary` fill; others use `--terminal-fg-muted`.
- **Link color**: active links use `--color-fd-primary`; inactive use `color-mix(in oklab, --color-fd-muted-foreground 50%, transparent)`.
- **Hover tooltip**: absolute div showing `node.description` at cursor position.
- **Reset View button**: bottom-right corner, calls `zoomToFit(200, 40)`.
- **Height**: `h-[min(60dvh,50rem)]` — fluid, no breakpoint (was `h-[60dvh] md:h-[800px]`).
- **Minimap**: bottom-left corner, 150×110px canvas. Renders all nodes/links in reduced scale. Viewport rectangle drawn in `--color-fd-primary` color. Updates in real time via `onZoom` handler tracking `k` (zoom), `x/y` (pan center).
- **Auto-fit**: on engine stop, `zoomToFit(200, 40)` is called once (guarded by `zoomedRef`).
- Forces: `forceLink` (distance 200), `forceManyBody` (strength 10), `forceCollide` (60).

## Mermaid tooltips

`.mermaidTooltip` pinned to `position: fixed` to prevent phantom scroll height from absolute-positioned tooltip div.

## Constraints

- No JS-injected styling except `next-themes` inline script (managed by RootProvider).
- Sharp corners everywhere (`--radius: 0`).
- Accessible contrast ratios (WCAG AA minimum).
- Both themes fully supported.
- KaTeX CSS imported for math rendering.
