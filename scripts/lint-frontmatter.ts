/**
 * Validate — and optionally scaffold — frontmatter in vault `.md` files.
 *
 * Required fields (per SPEC.md frontmatter schema):
 *   - title (must match filename, lowercased)
 *
 * Recommended fields:
 *   - description (short summary for graph tooltips)
 *
 * Auto-managed fields (stamped by sync:frontmatter, not checked here):
 *   - created_by, created_at, last_updated_by, last_updated_at
 *
 * Usage:
 *   tsx scripts/lint-frontmatter.ts          # check only, exit 1 on failure
 *   tsx scripts/lint-frontmatter.ts --fix   # insert template frontmatter where missing
 */
import { execSync } from "node:child_process"
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"

const VAULT_DIR = join(process.cwd(), "public/vault")
const FIX = process.argv.includes("--fix")

interface ValidationError {
	file: string
	missing: string[]
}

/** Minimal frontmatter parser — extracts the YAML block and a given key. */
function parseFrontmatter(raw: string): {
	hasFrontmatter: boolean
	fields: Record<string, string>
	body: string
} {
	const fmMatch = raw.match(/^---\n([\s\S]*?\n)---\n?([\s\S]*)$/)
	if (!fmMatch) return { hasFrontmatter: false, fields: {}, body: raw }

	const fmBlock = fmMatch[1]
	const body = fmMatch[2]
	const fields: Record<string, string> = {}

	for (const line of fmBlock.split("\n")) {
		const m = line.match(/^(\w+):\s*(.*)$/)
		if (m) fields[m[1]] = m[2].trim().replace(/^["']|["']$/g, "")
	}

	return { hasFrontmatter: true, fields, body }
}

/** Get git user name for created_by/last_updated_by. */
function gitUser(): string {
	try {
		return execSync("git config user.name", { encoding: "utf-8" }).trim()
	} catch {
		return ""
	}
}

/** UTC RFC 3339 timestamp. */
function nowUTC(): string {
	return new Date().toISOString().replace(/\.\d{3}Z$/, "Z")
}

/** Build a frontmatter block with required + recommended + stampable fields. */
function buildFrontmatter(slug: string): string {
	const user = gitUser()
	const ts = nowUTC()
	return [
		"---",
		`title: ${slug}`,
		'description: ""',
		`created_by: ${user}`,
		`created_at: ${ts}`,
		`last_updated_by: ${user}`,
		`last_updated_at: ${ts}`,
		"---",
		"",
	].join("\n")
}

function main(): void {
	const files = readdirSync(VAULT_DIR).filter((f) => f.endsWith(".md"))
	const errors: ValidationError[] = []
	let fixed = 0

	for (const file of files) {
		const fullPath = join(VAULT_DIR, file)
		const raw = readFileSync(fullPath, "utf-8")
		const slug = basename(file, ".md")
		const { hasFrontmatter, fields, body } = parseFrontmatter(raw)

		// Check required fields
		const missing: string[] = []
		if (!hasFrontmatter || !fields.title) missing.push("title")

		if (missing.length > 0) {
			if (FIX) {
				if (hasFrontmatter) {
					// Frontmatter exists but missing title — insert it + stampable fields
					const prefix = `---\ntitle: ${slug}\n`
					const updated = raw.replace(/^---\n/, prefix)
					writeFileSync(fullPath, updated, "utf-8")
				} else {
					// No frontmatter at all — prepend template
					writeFileSync(fullPath, buildFrontmatter(slug) + body, "utf-8")
				}
				console.log(`  ✓ ${file} — inserted frontmatter (title: ${slug})`)
				fixed++
				continue
			}
			errors.push({ file, missing })
		}

		// Warn about recommended fields
		if (!fields.description) {
			console.log(`  ⚠ ${file} — missing recommended field: description`)
		}
	}

	if (FIX) {
		if (fixed === 0) {
			console.log("✓ All vault files have required frontmatter.")
		} else {
			console.log(`→ Fixed ${fixed} file(s).`)
		}
		return
	}

	if (errors.length === 0) {
		console.log("✓ All vault files have required frontmatter (title).")
		return
	}

	console.error("✗ Frontmatter validation failed:\n")
	for (const err of errors) {
		console.error(`  ${err.file} — missing: ${err.missing.join(", ")}`)
	}
	console.error(
		`\n  ${errors.length} file(s) with missing frontmatter.\n  Run \`pnpm lint:frontmatter:fix\` to auto-insert.`,
	)
	process.exit(1)
}

main()
