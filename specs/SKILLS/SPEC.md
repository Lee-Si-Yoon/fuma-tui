# SPEC: Skills

## Goal

A `skills/` directory at repo root containing agent skills for authoring and maintaining glossary content. Skills follow the [Agent Skills specification](https://agentskills.io/specification) and are installable via `npx skills add`.

## Layout

```
skills/
├── README.md                          # Index of available skills
├── glossary-authoring/                # Entry authoring skill (MIT)
│   └── SKILL.md
├── obsidian-markdown/                  # Obsidian Flavored Markdown (MIT, from kepano/obsidian-skills)
│   ├── SKILL.md
│   └── references/
│       ├── PROPERTIES.md
│       ├── CALLOUTS.md
│       └── EMBEDS.md
├── obsidian-bases/                     # Obsidian Bases (.base) (MIT)
│   ├── SKILL.md
│   └── references/
│       └── FUNCTIONS_REFERENCE.md
└── json-canvas/                        # JSON Canvas (.canvas) (MIT)
    ├── SKILL.md
    └── references/
        └── EXAMPLES.md
```

## SKILL.md format

Each skill is a directory with a `SKILL.md` file:

```yaml
---
name: skill-name          # lowercase, hyphens, max 64 chars. Must match dir name.
description: ...          # max 1024 chars. What + when.
license: Proprietary      # optional (MIT for open-source skills)
metadata:                 # optional
  author: Lee-Si-Yoon
  version: "1.0"
---

# Instructions

Step-by-step instructions for the agent.
```

## Installation

```bash
# Install all skills from the repo
pnpm skills:install

# Update all installed skills to latest
pnpm skills:update

# Install a single skill from this repo
npx skills add ./skills/glossary-authoring

# Install from a URL
npx skills add ./skills/glossary-authoring
```

`scripts/skills-install.ts` and `scripts/skills-update.ts` manage batch install/update.

## Usage

After installation, skills are available to any agent that supports the Agent Skills format: Claude Code, OpenCode, Hermes Agent, GitHub Copilot, Cursor, and others.

The agent discovers skills at startup (reads name + description), activates on demand.

## Adding a new skill

1. Create `skills/<skill-name>/SKILL.md`
2. Write frontmatter (`name` must match directory name, `description` describes when to use)
3. Write instructions in Markdown body
4. Add reference files under `skills/<skill-name>/references/` if needed
5. Run `npx skills add ./skills/<skill-name>` to verify it installs
6. Update `skills/README.md` index table

## Current skills

| Skill | License | Description |
|-------|---------|-------------|
| `glossary-authoring` | MIT | Create and edit documentation entries. Enforces Obsidian markdown, wikilinks, frontmatter rules. |
| `obsidian-markdown` | MIT | Create and edit Obsidian Flavored Markdown with wikilinks, embeds, callouts, and properties. *(from [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills))* |
| `obsidian-bases` | MIT | Create and edit Obsidian Bases (`.base`) with views, filters, and formulas for structured term relationships. |
| `json-canvas` | MIT | Create and edit JSON Canvas (`.canvas`) files with nodes, edges, and groups for visual term graphs. |
