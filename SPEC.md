# SPEC: fuma-tui — Master

## Goal

TUI-styled documentation template for Obsidian vaults. Obsidian-flavored Markdown entries, interlinked via `[[wikilinks]]`, rendered as a styled docs site.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (canary), App Router |
| Docs | Fumadocs UI + Core, `fumadocs-obsidian` |
| Content | Obsidian-flavored Markdown in static vault (`public/vault/`) |
| Source | Dynamic loader (`fumadocs-core/source/dynamic`), hot-reload in dev |
| Styling | Tailwind CSS v4, blue-accent terminal/TUI, VT323 + JetBrains Mono, zero border-radius |
| Math | KaTeX (`remark-math` + `rehype-katex`) |
| Graph | `react-force-graph-2d` + `d3-force` |
| Search | ZBSearch (`fumadocs-core/search/server`) |
| OG Images | `next/og` (Satori), build-time SSG |
| Linting | Biome, rumdl, Vale, custom TS linters |
| Deploy | Vercel (zero env vars) |

## Project layout

```
├── app/                        # Next.js app router
│   ├── layout.tsx               # Root layout
│   ├── global.css               # Global styles (Tailwind v4)
│   ├── (glossary)/
│   │   ├── layout.tsx           # DocsLayout (sidebar, tree, theme switch)
│   │   └── docs/[[...slug]]/    # Glossary entry pages
│   ├── api/search/              # ZBSearch search API endpoint
│   ├── og/docs/[...slug]/       # OG image route (build-time SSG)
│   ├── llms.txt/                # LLM endpoint: directory
│   ├── llms-full.txt/           # LLM endpoint: full content
│   └── llms.mdx/docs/[[...slug]]/ # LLM endpoint: per-page Markdown
├── components/                  # React components
│   ├── react-bits/              # Third-party animation components
│   ├── themed-*.tsx             # Theme-aware wrappers
│   ├── frontmatter-meta.tsx     # Frontmatter display block
│   ├── graph-view.tsx           # Interactive wikilink graph
│   ├── callout.tsx              # Obsidian callout component
│   └── mermaid.tsx              # Mermaid diagram renderer
├── public/vault/                # Obsidian vault (glossary entries)
├── skills/                      # Agent skills (npx skills add)
├── specs/                       # Per-component SPEC.md
├── lib/                         # Shared libraries
│   ├── build-graph.ts            # Wikilink graph builder
│   ├── page-tree.ts              # Sidebar tree, neighbours, displayName
│   └── get-llm-text.ts          # LLM text extraction
├── scripts/                     # CLI scripts (see below)
├── source.ts                    # Fumadocs dynamic source, getPageImageUrl
├── proxy.ts                     # Edge proxy (Markdown negotiation only)
├── package.json
└── SPEC.md                      # ← this file (master spec)
```

## Scripts reference

All scripts live in `scripts/`. Run via `pnpm run <name>`.

### `dev` — Dev server

```bash
pnpm dev
```

`fumadocs-obsidian dev -- next dev`. Starts Next.js dev server with vault hot-reload. No `.env` required.

### `build` — Production build

```bash
pnpm build
```

`next build`. Compiles for Vercel deployment.

### `start` — Production server

```bash
pnpm start
```

`next start`. Serves the production build locally.

### `lint` — Biome check

```bash
pnpm lint
```

`biome check .`. Lints all TS/TSX files. Run before every commit.

### `typecheck` — TypeScript check

```bash
pnpm typecheck
```

`tsc --noEmit`. Type-checks without emitting. Run before every commit.

### `lint:md` — Markdown structure lint

```bash
pnpm lint:md
```

`rumdl check public/vault`. Checks vault markdown structure (heading levels, list formatting, etc.).

### `lint:prose` — Prose lint

```bash
pnpm lint:prose
```

`vale public/vault`. Enforces prose quality and spelling.

### `lint:links` — Internal link validation

```bash
pnpm lint:links
```

`tsx scripts/lint-links.ts`. Scans all vault pages for broken internal links and heading anchors. Uses `next-validate-link`.

- Checks wikilinks resolve to existing pages.
- Checks heading anchor links (`[[page#heading]]`) resolve.

### `lint:hierarchy` — Parent→child wikilink validation

```bash
pnpm lint:hierarchy
```

`tsx scripts/lint-hierarchy.ts`. Ensures every parent page links to all its children. Children are determined by `parent` frontmatter. Parent pages contain an auto-generated wikilink block delimited by HTML comments:

```markdown
<!-- BEGIN auto-generated child links — do not edit manually (lint:hierarchy:fix) -->
- [[child-1]]
- [[child-2]]
<!-- END auto-generated child links -->
```

Exit 1 if any parent is missing child links.

### `lint:hierarchy:fix` — Auto-sync child link blocks

```bash
pnpm lint:hierarchy:fix
```

`tsx scripts/lint-hierarchy.ts --fix`. Rewrites auto-generated child link blocks in parent pages. Safe to run anytime — only touches the delimited block.

### `lint:frontmatter` — Frontmatter validation

```bash
pnpm lint:frontmatter          # check
pnpm lint:frontmatter:fix     # auto-insert missing frontmatter
```

`tsx scripts/lint-frontmatter.ts`. Checks every vault `.md` file for required frontmatter fields (currently: `title`). Files without any frontmatter fail the check. Run `--fix` to auto-insert a template frontmatter block (using the filename as `title`).

### `lint:all` — Run all linters

```bash
pnpm lint:all
```

Runs typecheck + every linter in sequence. Stops on the first failure. Requires Vale to be installed (`bash scripts/setup.sh`).

```bash
pnpm typecheck && pnpm lint && pnpm lint:md && pnpm lint:prose && pnpm lint:links && pnpm lint:hierarchy && pnpm lint:frontmatter
```

### `sync:frontmatter` — Frontmatter author/timestamp stamping

```bash
pnpm sync:frontmatter
```

`tsx scripts/sync-frontmatter.ts`. For each **staged** vault `.md` file, stamps `git config user.name` and current UTC timestamp into frontmatter:

| Git status | Fields stamped |
|---|---|
| A (new file) | `created_by`, `created_at`, `last_updated_by`, `last_updated_at` |
| M (modified) | `last_updated_by`, `last_updated_at` only |

- Stamped files are re-staged (`git add`) so changes are in the same commit.
- No GitHub API token needed — runs offline from local git config.
- Only processes files under `public/vault/*.md`. Non-vault files are skipped.
- Manual run is safe (only processes staged files).

### `skills:install` — Batch skill installer

```bash
pnpm skills:install           # install all
pnpm skills:install --force   # re-install even if present
```

`tsx scripts/skills-install.ts`. Scans `skills/` for subdirectories with `SKILL.md` and runs `npx skills add <path>` for each. Skips already-installed skills unless `--force`.

### `skills:update` — Batch skill updater

```bash
pnpm skills:update
```

`tsx scripts/skills-update.ts`. Runs `npx skills update -y` to update all project-installed skills from their sources.

### `setup` — One-time local setup

```bash
bash scripts/setup.sh         # full setup
bash scripts/setup.sh --check # verify what's installed (no changes)
```

Installs Node dependencies, git pre-commit hook, Vale prose linter (if missing), and the `glossary-authoring` agent skill. Run once after cloning the repo. Use `--check` to audit what's installed without making changes.

## Git hooks

### Pre-commit hook

Installed via `bash scripts/install-hooks.sh`. Runs in order:

1. **`sync:frontmatter`** — stamps author + UTC timestamp into staged vault `.md` files, re-stages them.
2. **`lint:frontmatter`** — validates required frontmatter fields (`title`) on staged vault `.md` files.
3. **`lint:hierarchy`** — validates parent→child wikilink integrity.

If either step fails, the commit is blocked.

```bash
# Install hooks (run once after clone)
bash scripts/install-hooks.sh
```

## Standard workflow

```bash
# First-time setup
pnpm install
bash scripts/install-hooks.sh

# Daily dev
pnpm dev

# Before commit (hook runs automatically)
git add public/vault/your-entry.md
git commit -m "feat: add new entry"
# ↑ hook auto-stamps frontmatter + validates hierarchy

# Manual checks
pnpm lint               # Biome
pnpm typecheck          # TypeScript
pnpm lint:md            # Markdown structure
pnpm lint:prose         # Branded terms
pnpm lint:links         # Link validation
pnpm lint:hierarchy     # Hierarchy validation
pnpm lint:frontmatter  # Frontmatter validation
pnpm lint:all          # typecheck + every linter in one pass
pnpm lint:hierarchy:fix # Auto-fix hierarchy
pnpm build              # Production build
```

## Per-component specs

Each major component has a detailed SPEC.md in `specs/`:

| Spec | Description |
|---|---|
| [CONTENT](specs/CONTENT/SPEC.md) | Obsidian vault, source configuration, math rendering, frontmatter auto-stamping |
| [STYLING](specs/STYLING/SPEC.md) | Blue-accent terminal/TUI theme, fonts, scanline overlay |
| [GRAPH](specs/GRAPH/SPEC.md) | Interactive wikilink graph + minimap |
| [DEPLOYMENT](specs/DEPLOYMENT/SPEC.md) | Vercel config, dependencies, LLM endpoints |
| [SEARCH](specs/SEARCH/SPEC.md) | ZBSearch full-text search (no env vars required) |
| [OG](specs/OG/SPEC.md) | OG image generation (`next/og`, dark TUI style, build-time SSG) |
| [SKILLS](specs/SKILLS/SPEC.md) | Agent skills registry |

## Frontmatter schema

Defined in `source.ts` via Zod:

| Field | Required | Description |
|---|---|---|
| `title` | Yes | Display title (lowercase) |
| `created_by` | No | Author name (auto-stamped) |
| `created_at` | No | UTC RFC 3339 timestamp (auto-stamped) |
| `last_updated_by` | No | Last editor name (auto-stamped) |
| `last_updated_at` | No | Last edit UTC timestamp (auto-stamped) |
| `parent` | No | Wikilink name of parent term (enables sidebar tree) |
| `aliases` | No | List of alternate names / abbreviations |
| `description` | No | Short description (shown in graph tooltips) |

See [CONTENT spec](specs/CONTENT/SPEC.md) for full details.

## Constraints

- One term per file. Filename = term name (lowercase).
- All filenames, frontmatter titles, and wikilinks must be lowercase.
- Every entry should have `## See also` with wikilinks to related terms.
- Follow your org's branded-term rules (enforced by Vale, if configured).
- Frontmatter timestamps are auto-managed — do not edit manually.

## TODOs

1. i18n
2. Maintainers & stats