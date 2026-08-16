# fuma-tui

> The TUI-styled documentation template for your Obsidian vault.

Built on Fumadocs + Next.js. Styled like a terminal. Read by AI agents.

## What you get

Drop your Obsidian vault into `public/vault/` → ship to Vercel.

- 🔗 **Wikilink graph** — d3-force simulation + minimap
- 🤖 **AI-friendly** — `llms.txt` / `llms-full.txt` / `llms.mdx` endpoints
- 🖥️ **Terminal aesthetic** — VT323, CRT scanlines, zero border-radius, Utopia fluid scale
- ✅ **Team-ready** — Biome, rumdl, Vale, custom linters, git pre-commit hooks
- 🎨 **One-config rebrand** — `site.config.ts` → accent, logos, OG, scrollbars auto-derived
- ⚡ **Zero env vars** — deploy to Vercel as-is

## Quickstart

```bash
pnpm install
pnpm dev
```

No `.env` required for local dev.

## Stack

- **Framework**: Next.js 16 (canary) + Fumadocs UI/core
- **Content**: Obsidian-flavored Markdown (`fumadocs-obsidian`), static vault in `public/vault/`
- **Source**: Dynamic loader (`fumadocs-core/source/dynamic`) with hot-reload in dev
- **Styling**: Terminal/TUI aesthetic, VT323 + JetBrains Mono fonts, zero border-radius
- **Math**: KaTeX via `remark-math` + `rehype-katex` (block and inline)
- **Graph**: `react-force-graph-2d` with `d3-force` simulation and minimap
- **Linting**: Biome (code), rumdl (markdown), Vale (prose), link + hierarchy linters
- **Search**: ZBSearch (via `fumadocs-core/search/server`), no env vars required
- **OG Images**: `next/og` (Satori), dark TUI style, build-time static
- **Deploy**: Vercel, zero env vars

## Rebranding

Edit `site.config.ts` at the repo root. One file controls everything:

- Site name, description, GitHub repo link
- Accent color → every themed element derived automatically
- Logos, favicon, OG brand text

See [TEMPLATE_SETUP.md](TEMPLATE_SETUP.md) for the full guide. For writing entries, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Project layout

```
├── app/                    # Next.js app router
│   ├── layout.tsx          # Root layout (RootProvider, metadataBase, ThemedClickSpark)
│   ├── (glossary)/
│   │   ├── layout.tsx       # DocsLayout (sidebar, tree, theme switch)
│   │   └── docs/[[...slug]]/# Entry pages
│   ├── api/search/          # ZBSearch search API endpoint
│   ├── og/docs/[...slug]/    # OG image route (build-time SSG)
│   ├── llms.txt/             # LLM endpoint: directory
│   ├── llms-full.txt/        # LLM endpoint: full content
│   └── llms.mdx/docs/[[...slug]]/ # LLM endpoint: per-page Markdown
├── components/              # React components
│   ├── react-bits/          # Third-party animation components (pixel-blast, decrypted-text, border-glow)
│   ├── themed-*.tsx         # Theme-aware wrappers for react-bits
│   ├── graph-view.tsx       # Interactive wikilink graph
│   ├── frontmatter-meta.tsx # Frontmatter display block
│   ├── callout.tsx          # Obsidian callout component
│   ├── mermaid.tsx          # Mermaid diagram renderer
│   └── ...
├── public/vault/            # Obsidian vault (your entries)
├── skills/                  # Agent skills (npx skills add)
├── specs/                   # SPEC.md per component
│   ├── CONTENT/             # Obsidian vault content
│   ├── STYLING/             # Terminal/TUI theme
│   ├── GRAPH/               # Graph view + minimap
│   ├── DEPLOYMENT/          # Vercel config
│   └── SKILLS/              # Skills registry
├── lib/                     # Shared libraries
│   ├── build-graph.ts        # Wikilink graph builder
│   ├── page-tree.ts          # Sidebar tree, neighbours, displayName
│   └── get-llm-text.ts       # LLM text extraction
├── scripts/                 # CLI scripts
│   ├── install-hooks.sh      # Git hook installer (pre-commit)
│   ├── sync-frontmatter.ts   # Frontmatter author/timestamp stamping
│   ├── lint-hierarchy.ts     # Parent→child wikilink validation
│   ├── lint-links.ts         # Link validation
│   ├── skills-install.ts     # Batch skill installer
│   └── skills-update.ts      # Batch skill updater
├── source.ts                # Fumadocs dynamic source, getPageImageUrl helper
├── proxy.ts                 # Edge proxy (Markdown negotiation)
├── site.config.ts           # ← edit this to rebrand
└── package.json
```

## Writing entries

See `skills/glossary-authoring/SKILL.md` or:

```bash
npx skills add ./skills/glossary-authoring
```

## Linting

```bash
pnpm lint              # Biome: code
pnpm lint:md           # rumdl: markdown structure
pnpm lint:all          # typecheck + every linter in one pass
pnpm lint:prose        # Vale: branded terms, spelling
pnpm lint:links        # Internal link validation
pnpm lint:hierarchy    # Parent→child wikilink validation
pnpm lint:frontmatter  # Required frontmatter validation
pnpm lint:hierarchy:fix # Auto-sync child link blocks
pnpm sync:frontmatter  # Stamp author/timestamps on staged vault files
pnpm typecheck         # TypeScript
pnpm build             # Production build
```

See [SPEC.md](SPEC.md) for full scripts reference and standard workflow. New contributors: read [CONTRIBUTING.md](CONTRIBUTING.md).

## Specs

Root: [SPEC.md](SPEC.md) — master spec (stack, layout, scripts, frontmatter, constraints).

Per-component specs in `specs/`:

- [CONTENT](specs/CONTENT/SPEC.md) — Obsidian vault, source configuration, math rendering
- [STYLING](specs/STYLING/SPEC.md) — Terminal/TUI theme
- [GRAPH](specs/GRAPH/SPEC.md) — Interactive wikilink graph + minimap
- [DEPLOYMENT](specs/DEPLOYMENT/SPEC.md) — Vercel, dependencies, LLM endpoints
- [SEARCH](specs/SEARCH/SPEC.md) — ZBSearch full-text search (no env vars required)
- [OG](specs/OG/SPEC.md) — OG image generation (next/og, dark TUI style)
- [SKILLS](specs/SKILLS/SPEC.md) — Agent skills registry

## Sticker

Welcome to print it out :D

## Contributions

Make sure to read the [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.
