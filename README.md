<a target="_blank" rel="noopener noreferrer" href="/Lee-Si-Yoon/fuma-tui/blob/main/public/fuma-tui-social-dark.png">
  <img src="/Lee-Si-Yoon/fuma-tui/raw/main/public/fuma-tui-social-dark.png" alt="fuma-tui banner" style="max-width: 100%;">
</a>

> The TUI-styled documentation template for your Obsidian vault.

Built on [Fumadocs](https://fumadocs.dev) + Next.js. Styled like a terminal. Read by AI agents.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLee-Si-Yoon%2Ffuma-tui)

## What you get

Drop your Obsidian vault into `public/vault/` → ship to Vercel.

- 🔗 **Wikilink graph** — d3-force simulation + minimap
- 🤖 **AI-friendly** — `llms.txt` / `llms-full.txt` / `llms.mdx` endpoints
- 🖥️ **Terminal aesthetic** — VT323, CRT scanlines, zero border-radius, Utopia fluid scale
- ✅ **Team-ready** — Biome, rumdl, Vale, custom linters, git pre-commit hooks
- 🎨 **One-config rebrand** — `site.config.ts` → accent, logos, OG, scrollbars auto-derived
- ⚡ **Zero env vars** — deploy to Vercel as-is
- 📋 **Spec-driven** — every component has a `SPEC.md`; AI agents develop against specs, not assumptions

## Quickstart

```bash
pnpm install
bash scripts/setup.sh
pnpm dev
```

## Rebranding

Edit `site.config.ts` at the repo root. One file controls everything:

- Site name, description, GitHub repo link
- Accent color → every themed element derived automatically
- Logos, favicon, OG brand text

See [TEMPLATE_SETUP.md](TEMPLATE_SETUP.md) for the full guide. For writing entries, see [CONTRIBUTING.md](CONTRIBUTING.md).

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

---

<a target="_blank" rel="noopener noreferrer" href="https://github.com/fuma-nama/fumadocs">
  <img src="https://github.com/fuma-nama/fumadocs/raw/dev/documents/logo.png" alt="Fumadocs sticker" style="max-width: 100%;">
</a>
