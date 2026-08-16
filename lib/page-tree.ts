import type { Folder, Item, Node, Root } from "fumadocs-core/page-tree"
import { siteConfig } from "@/site.config"
import type { GlossaryPage, GlossarySource } from "@/source"

interface TreeEntry {
	page: GlossaryPage
	parent?: string
	children: TreeEntry[]
}

/** Display name for sidebar ToC: README → all caps, others → Title Case. */
export function displayName(title: string): string {
	if (title === "readme") return "README"
	if (title === "ai-llms") return "AI & LLMs"
	if (title === "table-of-contents") return "Table of Contents"
	return title.replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Build a hierarchical page tree from `parent` frontmatter.
 * Pages whose `parent` matches another page's title become children of that
 * page. A page with children becomes a Folder (with itself as index); a
 * childless page becomes an Item.
 */
export function buildGlossaryTree(source: GlossarySource): Root {
	const pages = source.getPages()
	const entries = new Map<string, TreeEntry>()

	for (const page of pages) {
		const fm = page.data.frontmatter as Record<string, unknown>
		const parent = typeof fm.parent === "string" ? fm.parent : undefined
		entries.set(page.data.title, { page, parent, children: [] })
	}

	// Wire parent → children
	const roots: TreeEntry[] = []
	for (const entry of entries.values()) {
		if (entry.parent && entries.has(entry.parent)) {
			entries.get(entry.parent)?.children.push(entry)
		} else {
			roots.push(entry)
		}
	}

	const sortEntries = (a: TreeEntry, b: TreeEntry) => {
		const order = (t: string) =>
			t === "home"
				? 0
				: t === "readme"
					? 1
					: t === "table-of-contents"
						? 2
						: t === "ai-llms"
							? 3
							: t === "internal"
								? 4
								: 5
		return (
			order(a.page.data.title) - order(b.page.data.title) ||
			a.page.data.title.localeCompare(b.page.data.title)
		)
	}

	function toNode(entry: TreeEntry): Node {
		const item: Item = {
			type: "page",
			name: displayName(entry.page.data.title),
			url: entry.page.url,
			$id: entry.page.slugs.join("/"),
		}

		if (entry.children.length > 0) {
			entry.children.sort(sortEntries)
			const folder: Folder = {
				type: "folder",
				name: displayName(entry.page.data.title),
				index: item,
				$id: entry.page.slugs.join("/"),
				children: entry.children.map(toNode),
				defaultOpen: true,
			}
			return folder
		}
		return item
	}

	roots.sort(sortEntries)

	return {
		type: "root",
		name: siteConfig.name,
		children: roots.map(toNode),
	}
}

/**
 * Flatten the tree to get ordered pages for prev/next navigation,
 * visiting folders' index page first, then children.
 */
export function getOrderedPages(source: GlossarySource): GlossaryPage[] {
	const tree = buildGlossaryTree(source)
	const ordered: GlossaryPage[] = []
	const byUrl = new Map(source.getPages().map((p) => [p.url, p]))

	function visit(node: Node) {
		if (node.type === "page") {
			const page = byUrl.get(node.url)
			if (page) ordered.push(page)
		} else if (node.type === "folder") {
			if (node.index) {
				const page = byUrl.get(node.index.url)
				if (page) ordered.push(page)
			}
			for (const child of node.children) visit(child)
		}
	}

	for (const child of tree.children) visit(child)
	return ordered
}

/** Get prev/next pages relative to a given page URL. */
export function getNeighbours(
	source: GlossarySource,
	currentUrl: string,
): {
	previous?: GlossaryPage
	next?: GlossaryPage
} {
	const pages = getOrderedPages(source)
	const idx = pages.findIndex((p) => p.url === currentUrl)
	if (idx === -1) return {}
	return {
		previous: idx > 0 ? pages[idx - 1] : undefined,
		next: idx < pages.length - 1 ? pages[idx + 1] : undefined,
	}
}
