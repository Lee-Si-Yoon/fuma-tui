/**
 * Pre-commit frontmatter stamping for vault `.md` files.
 *
 * For each staged vault file, writes the committer's name (from
 * `git config user.name`) and the current UTC RFC 3339 timestamp into
 * the file's YAML frontmatter:
 *
 *   - New file (git status A):  created_by, created_at,
 *                               last_updated_by, last_updated_at
 *   - Modified file (status M): last_updated_by, last_updated_at only
 *
 * Modified files are re-staged so the frontmatter change is included in
 * the same commit.
 *
 * Usage:  tsx scripts/sync-frontmatter.ts   (run from pre-commit hook)
 */
import { execSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

/** Fields managed by this script — in frontmatter order. */
const STAMPABLE = [
	"created_by",
	"created_at",
	"last_updated_by",
	"last_updated_at",
] as const

// ---------- git helpers -------------------------------------------------------

function gitUser(): string {
	return execSync("git config user.name", { encoding: "utf-8" }).trim()
}

/** Staged vault .md files with their git status (A=add, M=modified, R=rename). */
function stagedVaultFiles(): { file: string; status: string }[] {
	const out = execSync("git diff --cached --name-status", {
		encoding: "utf-8",
	}).trim()
	if (!out) return []

	return out
		.split("\n")
		.map((line) => {
			const [status, ...rest] = line.split("\t")
			// Rename: R  old.md\tnew.md — use the new path
			const file = rest[rest.length - 1] ?? ""
			return { file, status: status[0] }
		})
		.filter(
			({ file, status }) =>
				file.startsWith("public/vault/") &&
				file.endsWith(".md") &&
				["A", "M", "R"].includes(status),
		)
}

function restage(path: string): void {
	execSync(`git add "${path}"`, { stdio: "pipe" })
}

// ---------- frontmatter stamping ---------------------------------------------

/**
 * Minimal frontmatter upsert: updates or inserts a key in the YAML block.
 * Preserves existing field ordering; new keys are inserted right after
 * the matching placeholder (or before the closing --- if no placeholder).
 */
function stampFrontmatter(raw: string, stamps: Record<string, string>): string {
	// Match: ---\n ... \n---\n
	const fmMatch = raw.match(/^---\n([\s\S]*?\n)---\n?/)
	if (!fmMatch) {
		// No frontmatter — create one
		const fm = [
			"---",
			...STAMPABLE.map((k) => (stamps[k] ? `${k}: ${stamps[k]}` : `${k}: ""`)),
			"---",
			"",
		].join("\n")
		return fm + raw
	}

	const fmBlock = fmMatch[1]
	const rest = raw.slice(fmMatch[0].length)
	const lines = fmBlock.split("\n")

	for (const [key, value] of Object.entries(stamps)) {
		const idx = lines.findIndex((l) => l.startsWith(`${key}:`))
		if (idx !== -1) {
			lines[idx] = `${key}: ${value}`
		} else {
			// Insert in canonical order after an existing stampable field.
			let insertAt = -1
			for (let i = 0; i < lines.length; i++) {
				for (const k of STAMPABLE) {
					if (lines[i].startsWith(`${k}:`)) insertAt = i
				}
			}
			if (insertAt !== -1) {
				lines.splice(insertAt + 1, 0, `${key}: ${value}`)
			} else {
				// No stampable field exists — prepend before closing.
				lines.splice(lines.length - 1, 0, `${key}: ${value}`)
			}
		}
	}

	return `---\n${lines.join("\n")}---\n${rest}`
}

// ---------- main --------------------------------------------------------------

function main(): void {
	const files = stagedVaultFiles()
	if (files.length === 0) {
		console.log("→ No staged vault .md files to stamp.")
		return
	}

	const user = gitUser()
	const now = new Date()
	const ts = `${now.toISOString().replace(/\.\d{3}Z$/, "Z")}` // 2026-08-15T12:34:56Z

	let newCount = 0
	let modCount = 0

	for (const { file, status } of files) {
		const fullPath = join(process.cwd(), file)
		const raw = readFileSync(fullPath, "utf-8")

		const isNew = status === "A"
		const stamps: Record<string, string> = isNew
			? {
					created_by: user,
					created_at: ts,
					last_updated_by: user,
					last_updated_at: ts,
				}
			: {
					last_updated_by: user,
					last_updated_at: ts,
				}

		const updated = stampFrontmatter(raw, stamps)
		if (updated === raw) {
			console.log(`  ✓ ${file} — already up to date`)
			continue
		}

		writeFileSync(fullPath, updated, "utf-8")
		restage(file)
		console.log(
			`  ✓ ${file} — ${isNew ? "created" : "updated"} by ${user} @ ${ts}`,
		)
		if (isNew) newCount++
		else modCount++
	}

	console.log(`→ Stamped ${newCount} new + ${modCount} modified vault file(s).`)
}

main()
