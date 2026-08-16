import type { GlossaryPage } from "@/source"

/**
 * Convert a page into static Markdown content for LLMs.
 * Obsidian source stores raw markdown in `page.data.content`.
 */
export async function getLLMText(page: GlossaryPage): Promise<string> {
	const content = page.data.content ?? ""
	return `# ${page.data.title} (${page.url})\n\n${content}`
}
