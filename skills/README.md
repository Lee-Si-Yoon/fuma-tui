# Skills

Agent skills for this repository.

```bash
pnpm skills:install    # Install all skills from skills/ directory
pnpm skills:update     # Update all installed skills to latest
```

Or install individually with `npx skills add ./skills/<skill-name>`.

Or reference directly in any agent that supports the [Agent Skills format](https://agentskills.io).

## Available skills

| Skill | Description |
|-------|-------------|
| [glossary-authoring](./glossary-authoring/) | Write and edit documentation entries. Enforces Obsidian markdown, wikilinks, and frontmatter rules. |
| [obsidian-markdown](./obsidian-markdown/) | Create and edit Obsidian Flavored Markdown with wikilinks, embeds, callouts, and properties. *(from [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills), MIT)* |
| [obsidian-bases](./obsidian-bases/) | Create and edit Obsidian Bases (`.base`) with views, filters, and formulas for structured term relationships. *(MIT)* |
| [json-canvas](./json-canvas/) | Create and edit JSON Canvas (`.canvas`) files with nodes, edges, and groups for visual term graphs. *(MIT)* |

## Compatibility

Skills follow the [Agent Skills specification](https://agentskills.io/specification): each skill is a directory with a `SKILL.md` file containing YAML frontmatter and Markdown instructions. Compatible with Claude Code, OpenCode, Hermes Agent, GitHub Copilot, and any agent that supports the format.
