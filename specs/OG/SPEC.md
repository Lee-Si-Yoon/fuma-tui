# SPEC: OG Image Generation

## Goal

Generate dynamic Open Graph preview images for every glossary page at build time. Images match the site's dark TUI aesthetic — terminal background, blue accent, monospace, dashed borders.

## Stack

| Layer | Technology |
|---|---|
| Engine | `next/og` (Vercel Satori) |
| Format | PNG, 1200×630 |
| Generation | Build-time SSG via `generateStaticParams` |
| Caching | `revalidate = false` — static, no runtime regeneration |

## Architecture

```
source.ts
  └ getPageImageUrl(page) → { segments, url }
       segments = [...page.slugs, "image.png"]
       url      = /og/docs/<slug>/image.png

app/(glossary)/docs/[[...slug]]/page.tsx
  └ generateMetadata() → openGraph.images = getPageImageUrl(page).url

app/og/docs/[...slug]/route.tsx
  └ GET()              → strips trailing "image.png", resolves page, renders OgImage
  └ generateStaticParams() → all pages × getPageImageUrl segments
```

### Route resolution

The `image.png` suffix in the URL is artificial — it exists so Open Graph crawlers see a `.png` extension. The route handler strips the last segment (`slug.slice(0, -1)`) to recover the actual page slug.

### Caching

| Setting | Value | Effect |
|---|---|---|
| `revalidate` | `false` | Build-time only, no ISR |
| `generateStaticParams` | All pages | Pre-renders every OG image at build |
| Runtime | Static file | No rendering cost on request |

Rebuild = full regeneration. Changed pages get new images automatically.

## OgImage component

| Section | Description |
|---|---|
| Top bar | Three terminal dot circles + `fuma-tui — <title>` |
| Title | Page title, 72px, accent blue |
| Description | Page description, 36px, dimmed, dashed top border |
| Bottom row | Book icon (SVG) + "fuma-tui" + terminal cursor blocks |

### Colors

| Variable | Value | Used for |
|---|---|---|
| `accent` | `#0095ff` | Title, borders, icons, dots |
| `accentDim` | `rgba(0,149,255,0.7)` | Terminal title text |
| `accentMuted` | `rgba(0,149,255,0.15)` | Dashed borders, dim dots |
| Background | `#0a0d12` | Root container |
| Foreground | `#d1d5db` | Body text |

### Satori constraints

- Every `div` with multiple children must have `display: flex` (Satori requirement).
- SVG elements must have `role="img"` and `aria-label` for Biome a11y.
- No external fonts — uses `monospace` system stack.

## Files

| File | Responsibility |
|---|---|
| `source.ts` | `getPageImageUrl()` helper |
| `app/(glossary)/docs/[[...slug]]/page.tsx` | `generateMetadata()` with OG image URL |
| `app/og/docs/[...slug]/route.tsx` | Route handler, OgImage component, `generateStaticParams` |
| `app/layout.tsx` | `metadataBase` for OG URL resolution |
