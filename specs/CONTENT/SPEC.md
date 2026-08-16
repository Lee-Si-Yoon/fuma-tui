# SPEC: Content (Obsidian Vault)

## Goal

Documentation entries as Obsidian-flavored Markdown in a static vault. Entries are inter-linked via `[[wikilinks]]`. Supports math (KaTeX) and Mermaid diagrams.

## Layout

```
public/vault/
├── home.md              # Landing page (frontmatter only, PixelBlast bg)
├── readme.md            # Intro with DecryptedText brand animation
├── table-of-contents.md # Graph view of all entries and their wikilink relationships
├── ai-llms.md            # AI/LLM terminology hub
├── internal.md           # Internal category hub
├── suite.md              # Suite entry (child of internal)
├── hot-keys.md           # (child of internal)
└── lorem.md              # Placeholder entry
```

All filenames and frontmatter titles are lowercase.

## Source configuration

`source.ts` (repo root) uses `fumadocs-obsidian` with a **dynamic** source via `fumadocs-core/source/dynamic`:

```ts
const vault = obsidian({
  dir: "public/vault",
  url: (path) => `/vault/${path}`,
  frontmatterSchema: frontmatterSchema.extend({
    created_by: z.string().optional(),
    created_at: z.string().optional(),
    last_updated_at: z.string().optional(),
    last_updated_by: z.string().optional(),
    parent: z.string().optional(), // wikilink name of parent term
  }),
  remarkPlugins: [remarkMath, remarkMdxMermaid],
  rehypeCodeOptions: false,       // disable built-in Shiki, re-added below
  rehypePlugins: [rehypeKatex, rehypeCode],
});

// Hot reload in dev so vault edits appear without a manual rebuild.
// Requires the `fumadocs-obsidian dev` wrapper in package.json scripts.dev.
if (process.env.NODE_ENV === "development") {
  void vault.devServer();
}

const vaultLoader = dynamicLoader(vault.dynamicSource(), {
  baseUrl: "/docs",
});

export async function getSource() {
  return vaultLoader.get();
}
```

### Plugin ordering (KaTeX vs Shiki)

`fumadocs-obsidian`'s `createProcessor` runs `rehypeCode` (Shiki) as the **first** rehype plugin, before user-supplied `rehypePlugins`. Since `remarkMath` converts block math `$$...$$` into `<pre><code class="language-math math-display">`, `rehypeCode` would swallow it as a code block before `rehypeKatex` gets a chance.

**Fix**: `rehypeCodeOptions: false` disables the built-in Shiki. `rehypeCode` is re-imported from `fumadocs-core/mdx-plugins/rehype-code` and added to `rehypePlugins` **after** `rehypeKatex`, so KaTeX processes math nodes first. See [Fumadocs math guide](https://www.fumadocs.dev/docs/markdown/math).

Inline math `$...$` is unaffected — it renders as inline `<code class="math-inline">` which `rehypeCode` never processes (it only intercepts `<pre>` elements).

Dynamic source means the vault is loaded at request time (with compile-time parsing). Dev mode enables hot reload via `vault.devServer()`.

### Exported types

- `GlossarySource` — `Awaited<ReturnType<typeof vaultLoader.get>>`
- `GlossaryPage` — `ReturnType<GlossarySource["getPages"]>[number]`
- `vault` — re-exported for scripts needing direct access

### Async `getSource()`

All callers must `await getSource()`. The function is async because `dynamicLoader` resolves the source lazily.

## Frontmatter

Required:
- `title` — display title (lowercase)

Optional:
- `created_by`, `created_at`, `last_updated_at`, `last_updated_by` — metadata (auto-stamped by pre-commit hook, see below)
- `parent` — wikilink name of parent term (enables hierarchical sidebar tree)
- `aliases` — list of alternate names / abbreviations
- `description` — short description (shown in graph tooltips)

## Frontmatter auto-stamping (`scripts/sync-frontmatter.ts`)

The pre-commit hook automatically stamps `created_by`/`created_at`/`last_updated_by`/`last_updated_at` for staged vault `.md` files using `git config user.name` and the current UTC timestamp (RFC 3339):

- **New file** (git status A): all four fields stamped.
- **Modified file** (git status M): only `last_updated_by` and `last_updated_at` updated.
- Stamped files are re-staged so the change is included in the same commit.
- No GitHub API token needed — runs fully offline from local git config.
- Manual run: `pnpm run sync:frontmatter` (only processes staged files).

## Wikilinks

- `[[term]]` → links to `term.md` (lowercase)
- `[[term|Display Text]]` → custom display text
- Aliases are resolved by fumadocs-obsidian

## Page tree (`lib/page-tree.ts`)

`buildGlossaryTree(source)` builds a hierarchical sidebar tree from `parent` frontmatter:
- Pages whose `parent` matches another page's title become children.
- A page with children becomes a Folder (with itself as index); a childless page becomes an Item.

`displayName()` maps titles to sidebar labels:
- `readme` → "README"
- `ai-llms` → "AI & LLMs"
- `table-of-contents` → "Table of Contents"
- Others → Title Case

Sort order (sidebar):
1. `home` (order 0)
2. `readme` (order 1)
3. `table-of-contents` (order 2)
4. `ai-llms` (order 3)
5. `internal` (order 4)
6. Others (order 5, alphabetical)

`getOrderedPages(source)` flattens the tree for prev/next navigation (NeighbourNav).
`getNeighbours(source, url)` returns prev/next pages relative to a URL.

## Graph view (`lib/build-graph.ts`)

`buildGraph(source)` constructs a `Graph` of all pages and their wikilink relationships:
- Parses `[[Term]]` syntax from raw markdown content (fumadocs-obsidian doesn't expose `extractedReferences`).
- Nodes: `{ id: url, url, text: displayName(title), description }`.
- Links: `{ source: url, target: url }` for each wikilink that resolves to a page.
- Self-links are excluded.

Rendered on the `table-of-contents` page via `<GraphView>` (see STYLING spec).

## Routing

- `/` → redirects to `/docs/home`
- `/docs` → redirects to `/docs/home`
- `/docs/:path*.md` → rewritten to `/llms.mdx/docs/:path*` (Markdown for AI agents)

## Rendering

`app/(glossary)/docs/[[...slug]]/page.tsx` renders each entry:

### Home page (`/docs/home`)
- PixelBlast background (via `ThemedPixelBlast`) with centered brand logo
- No body content (home.md has frontmatter only)
- Full viewport height (`h-dvh`)

### Readme page (`/docs/readme`)
- ThemedDecryptedText `siteConfig.readmeBrandText` with `animateOn="inViewHover"`, `sequential`, `revealDirection="start"`
- FrontmatterMeta (hidden on readme)
- Regular body content

### Table of Contents page (`/docs/table-of-contents`)
- FrontmatterMeta
- DocsBody with rendered MDX
- GraphView (interactive wikilink relationship graph)
- NeighbourNav

### Other pages
- FrontmatterMeta
- DocsBody with rendered MDX
- NeighbourNav (prev/next)

## FrontmatterMeta (`components/frontmatter-meta.tsx`)

Renders frontmatter metadata as a visible YAML block (nvim-style). Metadata fields: `created_by`, `created_at`, `last_updated_by`, `last_updated_at`, `parent`, `description`.

Timestamp fields (`created_at`, `last_updated_at`) are converted from UTC to the viewer's local timezone using `dayjs` with `utc`, `timezone`, and `customParseFormat` plugins:
- Parse formats: `YYYY-MM-DDTHH:mm:ssZ`, `YYYY-MM-DDTHH:mm:ss.SSSZ`, `YYYY-MM-DD` (bare dates)
- Output: RFC 3339 with numeric offset (e.g., `2026-08-12T09:00:00+09:00`)
- Timezone detected via `dayjs.tz.guess()`
- Conversion happens client-side only (after mount) to avoid hydration mismatch.

## Linting

- `pnpm run lint` — Biome (TS/TSX)
- `pnpm run lint:md` — rumdl (markdown structure)
- `pnpm run lint:prose` — vale (branded terms, spelling)
- `pnpm run lint:links` — tsx scripts/lint-links.ts (link validation)
- `pnpm run lint:hierarchy` — tsx scripts/lint-hierarchy.ts (parent→child wikilink validation)
- `pnpm run sync:frontmatter` — tsx scripts/sync-frontmatter.ts (stamp author/timestamps on staged vault files)
- Pre-commit hook runs `sync:frontmatter` then `lint:hierarchy` (installed via `scripts/install-hooks.sh`)

## Constraints

- One term per file. Filename = term name (lowercase).
- All filenames, frontmatter titles, and wikilinks must be lowercase.
- Every entry should have `## See also` with wikilinks to related terms.
- Follow your org's branded-term rules (enforced by Vale, if configured).
