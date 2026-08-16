import { remarkMdxMermaid } from "fumadocs-core/mdx-plugins"
import { rehypeCode } from "fumadocs-core/mdx-plugins/rehype-code"
import { dynamicLoader } from "fumadocs-core/source/dynamic"
import { frontmatterSchema, obsidian } from "fumadocs-obsidian"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import { z } from "zod"

// Obsidian vault in public/vault → served statically.
// Wikilinks ([[Term]]) resolve to /docs/<Term> routes.
//
// rehypeCode (Shiki) is disabled in the obsidian() config and re-added in
// rehypePlugins AFTER rehypeKatex — KaTeX must run before the syntax
// highlighter so block math ($$...$$) isn't swallowed as a code block.
// See: https://www.fumadocs.dev/docs/markdown/math
const vault = obsidian({
	dir: "public/vault",
	url: (path) => `/vault/${path}`,
	// Extend the default frontmatter schema with glossary metadata fields.
	// All fields optional — entries without them still parse fine.
	frontmatterSchema: frontmatterSchema.extend({
		created_by: z.string().optional(),
		created_at: z.string().optional(), // UTC timestamp
		last_updated_at: z.string().optional(), // UTC timestamp
		last_updated_by: z.string().optional(),
		parent: z.string().optional(), // wikilink name of parent term
	}),
	remarkPlugins: [remarkMath, remarkMdxMermaid],
	rehypeCodeOptions: false,
	rehypePlugins: [rehypeKatex, rehypeCode],
})

// Hot reload: watch vault files in dev so edits appear without a manual rebuild.
// Requires the `fumadocs-obsidian dev` wrapper in package.json scripts.dev.
if (process.env.NODE_ENV === "development") {
	void vault.devServer()
}

const vaultLoader = dynamicLoader(vault.dynamicSource(), {
	baseUrl: "/docs",
})

export async function getSource() {
	return vaultLoader.get()
}

// Re-export types for use across the app.
export type GlossarySource = Awaited<ReturnType<typeof vaultLoader.get>>
export type GlossaryPage = ReturnType<GlossarySource["getPages"]>[number]

// OG image helpers — `image.png` suffix lets the route handler strip
// the last segment and resolve the actual page slug.
export function getPageImageUrl(page: GlossaryPage) {
	const segments = [...page.slugs, "image.png"]
	return {
		segments,
		url: `/${["og", "docs", ...segments].join("/")}`,
	}
}

// Re-export the vault instance for scripts that need direct access.
export { vault }
