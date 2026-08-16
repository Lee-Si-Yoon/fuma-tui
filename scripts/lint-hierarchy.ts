/**
 * Enforce that every parent page links to all its children.
 *
 * A "parent" is any page referenced by another page's `parent` frontmatter.
 * The script maintains an auto-generated wikilink block in each parent page
 * delimited by HTML comments — the block is managed by --fix, not by humans.
 *
 * Usage:
 *   tsx scripts/lint-hierarchy.ts        # check only, exit 1 on failure
 *   tsx scripts/lint-hierarchy.ts --fix  # sync auto-generated block
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"

interface VaultEntry {
	slug: string
	title: string
	parent?: string
	raw: string
	body: string
}

const VAULT_DIR = join(process.cwd(), "public/vault")
const FIX = process.argv.includes("--fix")

const BEGIN =
	"<!-- BEGIN auto-generated child links — do not edit manually (lint:hierarchy:fix) -->"
const END = "<!-- END auto-generated child links -->"
const BLOCK_RE = new RegExp(
	`${escapeRegExp(BEGIN)}\\n([\\s\\S]*?)\\n${escapeRegExp(END)}`,
)

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Parse YAML-like frontmatter minimally — we only need `title` and `parent`. */
function parseFrontmatter(raw: string): {
	title?: string
	parent?: string
	body: string
} {
	const fmMatch = raw.match(/^---\n([\s\S]*?\n)---\n?([\s\S]*)$/)
	if (!fmMatch) return { body: raw }

	const fmBlock = fmMatch[1]
	const body = fmMatch[2]

	let title: string | undefined
	let parent: string | undefined

	for (const line of fmBlock.split("\n")) {
		const titleMatch = line.match(/^title:\s*(.+)$/)
		if (titleMatch) title = titleMatch[1].trim().replace(/^["']|["']$/g, "")
		const parentMatch = line.match(/^parent:\s*(.+)$/)
		if (parentMatch) parent = parentMatch[1].trim().replace(/^["']|["']$/g, "")
	}

	return { title, parent, body }
}

function loadVault(): VaultEntry[] {
	const files = readdirSync(VAULT_DIR).filter((f) => f.endsWith(".md"))
	return files.map((file) => {
		const raw = readFileSync(join(VAULT_DIR, file), "utf-8")
		const fm = parseFrontmatter(raw)
		const slug = basename(file, ".md")
		return {
			slug,
			title: fm.title ?? slug,
			parent: fm.parent,
			raw,
			body: fm.body,
		}
	})
}

/** Extract wikilink targets from a body (lowercased). */
function extractWikilinks(body: string): Set<string> {
	const re = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g
	const set = new Set<string>()
	let m = re.exec(body)
	while (m !== null) {
		set.add(m[1].trim().toLowerCase())
		m = re.exec(body)
	}
	return set
}

/** Build the auto-generated block content for a set of child titles. */
function buildBlock(childTitles: string[]): string {
	const links = childTitles.map((c) => `- [[${c}]]`).join("\n")
	return `${BEGIN}\n${links}\n${END}`
}

interface HierarchyError {
	parent: string
	missingChildren: string[]
}

function collectChildren(
	entries: VaultEntry[],
	byTitle: Map<string, VaultEntry>,
): Map<string, string[]> {
	const childrenByParent = new Map<string, string[]>()
	for (const entry of entries) {
		if (!entry.parent || !byTitle.has(entry.parent)) continue
		const arr = childrenByParent.get(entry.parent) ?? []
		arr.push(entry.title)
		childrenByParent.set(entry.parent, arr)
	}
	return childrenByParent
}

/** Sync auto-generated blocks: replaces existing block or appends a new one. */
function fixHierarchy(
	byTitle: Map<string, VaultEntry>,
	childrenByParent: Map<string, string[]>,
): string[] {
	const touched: string[] = []

	for (const [parentTitle, childTitles] of childrenByParent) {
		const parentEntry = byTitle.get(parentTitle)
		if (!parentEntry) continue

		const filePath = join(VAULT_DIR, `${parentTitle}.md`)
		const raw = parentEntry.raw
		const fmEnd = raw.match(/^---\n[\s\S]*?\n---\n?/)
		const frontmatter = fmEnd ? fmEnd[0] : ""
		const body = fmEnd ? raw.slice(frontmatter.length) : raw

		const expectedBlock = buildBlock(childTitles)
		const existing = body.match(BLOCK_RE)

		if (existing) {
			if (existing[0] === expectedBlock) continue
			const newBody = body.replace(BLOCK_RE, expectedBlock)
			writeFileSync(filePath, frontmatter + newBody, "utf-8")
		} else {
			const newBody = `${body.trimEnd()}\n\n${expectedBlock}\n`
			writeFileSync(filePath, frontmatter + newBody, "utf-8")
		}
		touched.push(parentTitle)
	}

	return touched
}

function main() {
	const entries = loadVault()
	const byTitle = new Map<string, VaultEntry>()
	for (const entry of entries) byTitle.set(entry.title, entry)
	const childrenByParent = collectChildren(entries, byTitle)
	const totalChildren = [...childrenByParent.values()].reduce(
		(n, arr) => n + arr.length,
		0,
	)

	if (FIX) {
		const touched = fixHierarchy(byTitle, childrenByParent)
		if (touched.length === 0) {
			console.log(
				`✓ Hierarchy check passed — ${totalChildren} parent→child link(s) verified.`,
			)
		} else {
			console.log(
				`✓ Synced ${touched.length} parent page(s): ${touched.join(", ")}`,
			)
		}
		process.exit(0)
	}

	// Check mode
	const errors: HierarchyError[] = []
	for (const [parentTitle, childTitles] of childrenByParent) {
		const parentEntry = byTitle.get(parentTitle)
		if (!parentEntry) continue
		const linked = extractWikilinks(parentEntry.body)
		const missing = childTitles.filter((c) => !linked.has(c.toLowerCase()))
		if (missing.length > 0) {
			errors.push({ parent: parentTitle, missingChildren: missing })
		}
	}

	if (errors.length === 0) {
		console.log(
			`✓ Hierarchy check passed — ${totalChildren} parent→child link(s) verified.`,
		)
		process.exit(0)
	}

	console.error(
		"✗ Hierarchy check failed — parent pages missing child links:\n",
	)
	for (const err of errors) {
		console.error(
			`  ${err.parent}.md is missing wikilinks for ${err.missingChildren.length} child(ren):`,
		)
		for (const child of err.missingChildren) {
			console.error(`    → [[${child}]]`)
		}
		console.error()
	}
	console.error(
		`  ${errors.length} parent(s) with missing links, ${totalChildren} total children.`,
	)
	console.error("  Run `pnpm lint:hierarchy:fix` to auto-sync child links.")
	process.exit(1)
}

main()
