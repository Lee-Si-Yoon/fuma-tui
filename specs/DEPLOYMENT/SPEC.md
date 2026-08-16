# SPEC: Deployment

## Goal

Deploy to Vercel. Zero env vars required.

## Configuration

Vercel project settings:

- Framework: Next.js
- Build command: `pnpm build`
- Output directory: `.next` (auto-detected)
- Node.js version: 22+
- Install command: `pnpm install`
- Package manager: pnpm (via `pnpm-workspace.yaml`)

## Scripts

```json
{
  "dev": "fumadocs-obsidian dev -- next dev",
  "build": "next build",
  "start": "next start",
  "lint": "biome check .",
  "lint:md": "rumdl check public/vault",
  "lint:prose": "vale public/vault",
  "lint:links": "tsx scripts/lint-links.ts",
  "lint:hierarchy": "tsx scripts/lint-hierarchy.ts",
  "lint:hierarchy:fix": "tsx scripts/lint-hierarchy.ts --fix",
  "sync:frontmatter": "tsx scripts/sync-frontmatter.ts",
  "lint:frontmatter": "tsx scripts/lint-frontmatter.ts",
  "lint:frontmatter:fix": "tsx scripts/lint-frontmatter.ts --fix",
  "lint:all": "pnpm typecheck && pnpm lint && pnpm lint:md && pnpm lint:prose && pnpm lint:links && pnpm lint:hierarchy && pnpm lint:frontmatter",
  "skills:install": "tsx scripts/skills-install.ts",
  "skills:update": "tsx scripts/skills-update.ts",
  "setup": "bash scripts/setup.sh",
  "setup:check": "bash scripts/setup.sh --check",
  "typecheck": "tsc --noEmit"
}
```

- `dev` uses `fumadocs-obsidian dev` wrapper for hot-reload of vault files.
- Pre-commit hook (`scripts/install-hooks.sh`) runs `lint:hierarchy`.

## Dependencies

Key runtime dependencies:

- `next` 16.3.1-canary.11 (Turbopack)
- `react` 19.3.0-canary / `react-dom` 19.3.0-canary
- `fumadocs-core`, `fumadocs-ui` ^16.14.3
- `fumadocs-obsidian` ^1.0.1
- `next-themes` ^0.4.6
- `zod` ^4.4.3
- `dayjs` ^1.11.21 (frontmatter timezone conversion)
- `postprocessing` ^6.39.4 (PixelBlast postprocessing effects)
- `three` ^0.185.1 (PixelBlast)
- `motion` ^13.1.0 (DecryptedText)
- `shiki` ^4.4.3 (syntax highlighting)
- `d3-force` ^3.0.0 (GraphView)
- `react-force-graph-2d` ^1.29.1
- `mermaid` ^11.16.1 (diagram rendering)
- `rehype-katex` ^7.0.1 / `remark-math` ^6.0.0 (math rendering)
- `katex` ^0.18.4 (math CSS)
- `lucide-react` ^1.31.0 (icons)

Key dev dependencies:

- `@biomejs/biome` ^2.0.0
- `tailwindcss` ^4.0.0 / `@tailwindcss/postcss` ^4.0.0
- `tsx` ^4.23.12 (script runner)
- `next-validate-link` ^1.6.7
- `rumdl` ^0.2.54 (markdown linter)
- `typescript` ^5.7.0

## Domain

Add a custom domain in Vercel project settings if needed. Configure DNS accordingly.

## LLM endpoints

The app exposes Markdown content for AI agents:

- `/llms.txt` — curated directory of available pages
- `/llms-full.txt` — full concatenated content
- `/llms.mdx/docs/:path` — individual page Markdown (via Accept header negotiation in `proxy.ts`)
- `.md` extension on any page URL (e.g., `/docs/lorem.md`) — per-page Markdown

## Constraints

- Dynamic source loading (not static generation). Vault parsed at build/request time via `fumadocs-core/source/dynamic`.
- Middleware (`proxy.ts`) runs on edge for Markdown negotiation.
- No server-side file system access at runtime (vault is parsed at compile time).
