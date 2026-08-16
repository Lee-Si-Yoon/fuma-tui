# Template Setup

This repo is a reusable docs site template. After cloning, follow this guide to rebrand and customize it for your project.

## 1. Configure the site

Open `site.config.ts` at the repo root. Each field has a JSDoc comment explaining what it controls. Key fields to change:

| Field | What it does |
|---|---|
| `name` | Browser tab title, OG metadata, sidebar root label |
| `description` | One sentence for meta tags and OG images |
| `repoOwner` / `repoName` | GitHub repo for the sidebar link |
| `packageName` | OG image top bar (`packageName — Page Title`) |
| `accentColor` | Primary accent (hex). Drives every accent-colored element automatically — links, buttons, graph nodes, sparks, borders, scrollbars, box-shadows. Dark theme. |
| `accentColorLight` | Light-mode accent. Usually a brighter shade for contrast on white. |
| `logo.src` | Sidebar wordmark SVG path in `public/` (dark mode). Set to `null` to use `name` as text. |
| `logo.srcLight` | Optional light-mode sidebar wordmark SVG. Omit or `null` to reuse `logo.src` for both themes. |
| `logo.alt` | Alt text for the sidebar logo. |
| `logo.height` | CSS height (e.g. `"2rem"`, `"32px"`). |
| `logoMark.src` | Home page symbol SVG path (dark mode), centered over PixelBlast. Set to `null` to hide. |
| `logoMark.srcLight` | Optional light-mode symbol. Omit or `null` to reuse `logoMark.src`. |
| `logoMark.alt` | Alt text for the home page symbol. |
| `logoMark.size` | CSS size for both width and height (e.g. `"8rem"`). |
| `favicon.src` | Browser tab icon. Set to `null` to use Next.js `app/icon.svg` instead. |
| `readmeBrandText` | DecryptedText animation on the README page. Empty string skips it. |
| `ogBrandText` | Bottom-row text in OG images (next to the book icon). |

The `og.accent` / `og.accentDim` / `og.accentMuted` getters are derived from `accentColor` automatically — override only if you need OG colors that differ from the site.

## 2. Replace the SVG assets

SVGs in `public/`, inlined via `loadSvgMark()` at build time:

| File | Where it shows up | Notes |
|---|---|---|
| `logo.src` (dark) + `logo.srcLight` (optional) | Sidebar nav title | Wordmark. Use `fill="currentColor"` for theme-following parts; explicit hex for fixed colors. When `srcLight` is set, a `.light`-scoped swap shows that file instead — dark is rendered during SSR, so there is no FOUC. |
| `logoMark.src` (dark) + `logoMark.srcLight` (optional) | Home page, centered over PixelBlast | Square symbol or icon. Not the wordmark. |
| `favicon.src` | Browser tab icon | 32×32 or larger viewBox. Favicons are not theme-aware — use fixed colors. |

### `srcLight` — when to use it

- **Skip it** if your logo already works in both themes (e.g. its shapes use `fill="currentColor"` and inherit CSS `color` per theme, or the colors are theme-agnostic). Leave `srcLight` unset and both themes reuse `src`.
- **Use it** when light and dark need **different colors or shapes** in the SVG source itself. Drop two files in `public/`, set both `src` and `srcLight`, and the template swaps them per theme. No CSS variables to wire up.

### `loadSvgMark()` behavior

- Strips `width`/`height` attributes only from the root `<svg>` tag so CSS controls sizing. Inner elements keep theirs.
- Injects `width="100%" height="100%"` on the root so the SVG fills its container.
- **Preserves all `fill` / `stroke` attributes as-is.** `currentColor` follows CSS `color`; explicit hex (`#fff`, `#2A62DB`, …) stays fixed regardless of theme.

## 3. Replace the vault content

Delete the demo entries and write your own in `public/vault/`:

```bash
rm public/vault/*.md
touch public/vault/home.md
```

Each entry is one Markdown file with YAML frontmatter:

```yaml
---
title: term-name
description: Short summary for graph tooltips.
parent: parent-term
---

# Term Name

One-sentence definition.

Detailed explanation.

## See also

- [[related-term-1]]
- [[related-term-2]]
```

Rules: one term per file, filename matches the title (lowercase), all wikilinks lowercase. Run `pnpm lint:frontmatter:fix` to scaffold frontmatter for new files.

## 4. Writing entries

For the full docs site authoring conventions — wikilink syntax, aliases, branded terms, callouts, math — see [CONTRIBUTING.md](CONTRIBUTING.md) or the `docs site-authoring` agent skill:

```bash
npx skills add ./skills/docs site-authoring
```

## 5. Vale branded terms (optional)

If your org has product names or spelling rules to enforce, edit the Vale styles in `.github/styles/`. If you don't need prose linting, remove `.github/styles/` entirely and delete the `lint:prose` script from `package.json`.

## 6. Deploying to Vercel

1. Push the repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js. No custom config needed.
4. Add a custom domain in project settings if you want one.

No environment variables required. Search runs in-process, the vault is static, and `vercel.json` is already configured.

## Running locally

```bash
pnpm install
pnpm dev
```

No `.env` file needed. The dev server hot-reloads vault files via `fumadocs-obsidian dev`.

```bash
pnpm lint:all   # typecheck + all linters
pnpm build      # production build
```
