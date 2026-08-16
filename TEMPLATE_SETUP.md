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
| `logo.src` | Sidebar wordmark SVG path in `public/`. Set to `null` to use `name` as text. |
| `logo.alt` | Alt text for the sidebar logo. |
| `logo.height` | CSS height (e.g. `"2rem"`, `"32px"`). |
| `logoMark.src` | Home page symbol SVG path (centered over PixelBlast). Set to `null` to hide. |
| `logoMark.alt` | Alt text for the home page symbol. |
| `logoMark.size` | CSS size for both width and height (e.g. `"8rem"`). |
| `favicon.src` | Browser tab icon. Set to `null` to use Next.js `app/icon.svg` instead. |
| `readmeBrandText` | DecryptedText animation on the README page. Empty string skips it. |
| `ogBrandText` | Bottom-row text in OG images (next to the book icon). |

The `og.accent` / `og.accentDim` / `og.accentMuted` getters are derived from `accentColor` automatically — override only if you need OG colors that differ from the site.

## 2. Replace the SVG assets

Three SVGs in `public/`:

| File | Where it shows up | Notes |
|---|---|---|
| `public/logo.svg` | Sidebar nav title | Wordmark. Use `fill="currentColor"` for theme-following parts; explicit hex for fixed colors. |
| `public/logo-mark.svg` | Home page, centered over PixelBlast | Square symbol or icon. Not the wordmark. |
| `public/favicon.svg` | Browser tab icon | 32×32 or larger viewBox. |

The SVGs are inlined via `loadSvgMark()` at build time — `width`/`height` attributes are stripped and replaced with `100%`, so the container controls sizing. All `fill` attributes are preserved as-is.

**Multi-color logos**: use explicit `fill="#fff"` (or any hex) for parts that should keep their color, and `fill="currentColor"` for parts that should follow the theme's accent. The CSS `color` on the container is set to `--terminal-fg` (dark theme) or the light accent.

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
