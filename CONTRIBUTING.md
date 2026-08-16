# Contributing

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Setup

```bash
git clone <repo-url> fuma-tui && cd fuma-tui
bash scripts/setup.sh
```

This installs Node deps, the git pre-commit hook, Vale, and the `glossary-authoring` agent skill. To check what's installed without making changes:

```bash
bash scripts/setup.sh --check
```

## Writing an entry

### 1. Create the file

One term per file in `public/vault/`. Filename is lowercase, hyphenated if needed.

```bash
touch public/vault/term-name.md
```

### 2. Scaffold frontmatter

```bash
pnpm lint:frontmatter:fix
```

This inserts `title` (from the filename) and an empty `description`. Fill in the rest. The frontmatter schema lives in [SPEC.md](SPEC.md#frontmatter-schema). Don't touch `created_by`, `created_at`, `last_updated_by`, `last_updated_at` — the pre-commit hook stamps those automatically.

### 3. Write

Follow the [glossary-authoring skill](skills/glossary-authoring/SKILL.md) for the full conventions. The basic structure:

```markdown
---
title: term-name
description: Short summary for graph tooltips.
parent: parent-term
aliases: [TN]
---

# Term Name

One-sentence definition.

Detailed explanation.

## See also

- [[Related Term 1]]
- [[Related Term 2]]
```

Wikilinks (`[[term-name]]`) resolve to `term-name.md`. If the entry has a `parent`, the hierarchy linter auto-generates a child link block in the parent page.

### 4. Lint

```bash
pnpm lint:all
```

Runs typecheck, Biome, rumdl, Vale, link validation, hierarchy, and frontmatter checks in one pass. If hierarchy or frontmatter fail, the `:fix` variants auto-fix:

```bash
pnpm lint:hierarchy:fix
pnpm lint:frontmatter:fix
```

### 5. Commit

```bash
git add public/vault/term-name.md
git commit -m "feat: add Term Name"
```

The pre-commit hook runs three steps: `sync:frontmatter` (stamps author + timestamp), `lint:frontmatter` (checks `title`), then `lint:hierarchy` (checks parent-to-child wikilink integrity). A failure in any step blocks the commit. Fix and re-commit.

## Troubleshooting

- `lint:frontmatter` fails: `pnpm lint:frontmatter:fix` inserts missing frontmatter.
- `lint:hierarchy` fails: `pnpm lint:hierarchy:fix` syncs child link blocks.
- Pre-commit hook not running: `bash scripts/install-hooks.sh`.
- Vale not installed: `bash scripts/setup.sh` or `brew install vale`.

## Reference

- [SPEC.md](SPEC.md) — full scripts reference, frontmatter schema, constraints
- [README.md](README.md) — stack, project layout, linting commands
- [glossary-authoring skill](skills/glossary-authoring/SKILL.md) — entry structure, wikilinks, branded terms
- [specs/CONTENT/SPEC.md](specs/CONTENT/SPEC.md) — vault source config, frontmatter auto-stamping
