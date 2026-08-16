import type { Graph } from "@/components/graph-view"
import { displayName } from "@/lib/page-tree"
import type { GlossarySource } from "@/source"

/**
 * Build a graph of pages and their wikilink relationships.
 * Parses `[[Term]]` syntax from raw markdown content since
 * fumadocs-obsidian doesn't expose `extractedReferences`.
 */
export function buildGraph(source: GlossarySource): Graph {
	const pages = source.getPages()
	const titleToUrl = new Map<string, string>()
	const graph: Graph = { links: [], nodes: [] }

	for (const page of pages) {
		titleToUrl.set(page.data.title, page.url)
	}

	for (const page of pages) {
		graph.nodes.push({
			id: page.url,
			url: page.url,
			text: displayName(page.data.title),
			description: page.data.description,
		})

		const content = page.data.content ?? ""
		const wikiRegex = /\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g
		let match = wikiRegex.exec(content)
		while (match !== null) {
			const targetTitle = match[1].trim()
			const targetUrl = titleToUrl.get(targetTitle)
			if (targetUrl && targetUrl !== page.url) {
				graph.links.push({
					source: page.url,
					target: targetUrl,
				})
			}
			match = wikiRegex.exec(content)
		}
	}

	return graph
}
