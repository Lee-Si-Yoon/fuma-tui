---
name: glossary-authoring
description: >
  Write and edit documentation entries for your vault.
  Use when creating, editing, or reviewing content in public/vault/.
  Enforces Obsidian markdown conventions, wikilink usage, and frontmatter rules.
license: MIT
metadata:
  author: Lee-Si-Yoon
  version: "1.0"
compatibility: Requires vale and rumdl for linting
---

# Glossary Authoring

## Entry structure

Each glossary entry is a single Markdown file in `public/vault/`.

```
public/vault/
├── Term Name.md       # one entry per file, filename = term name
├── Another Term.md
└── ...
```

## Frontmatter

Every entry must include `title`. Use `aliases` for abbreviations or alternate names.

```yaml
---
title: Tensor Cache
aliases: [TCache]
---
```

## Body structure

```markdown
# Term Name

One-sentence definition.

Detailed explanation paragraph(s).

## See also

- [[Related Term 1]]
- [[Related Term 2]]
```

## Wikilinks

Use Obsidian `[[Wikilinks]]` to link to other entries. The link target
matches the filename without `.md`.

- `[[Tensor Cache]]` → links to `Tensor Cache.md`
- `[[TCache]]` → works if "TCache" is in aliases and the source resolves aliases
- Use display text: `[[Tensor Cache|TCache]]`

## Branded terms

If your org has product names or spelling rules, configure Vale styles in
`.github/styles/`. Run `pnpm lint:prose` to check.

## Linting

```bash
pnpm lint:md       # rumdl: markdown lint
pnpm lint:prose    # vale: branded terms, spelling
```

Both must pass before commit.

## Adding a new entry

1. Create `public/vault/Term Name.md`
2. Add frontmatter (`title`, optional `aliases`, `parent` if nested)
3. Write definition + explanation
4. If this entry has a `parent`, add a `[[This Term]]` wikilink to the parent page body
5. Add `## See also` with wikilinks to related terms
6. Run `pnpm lint:md && pnpm lint:prose && pnpm lint:hierarchy`
7. Verify wikilinks resolve: `pnpm build` should succeed

## Hierarchy enforcement

Every parent page must link to all its children via `[[wikilinks]]`.

- If page B has `parent: A` in frontmatter, then `A.md` body must contain `[[B]]`.
- Enforced by `pnpm lint:hierarchy` — fails the commit if any parent is missing a child link.
