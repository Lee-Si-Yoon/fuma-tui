#!/usr/bin/env tsx
import { execSync } from "node:child_process"
/**
 * Install all skills from the skills/ directory into the current project.
 *
 * Scans `skills/` for subdirectories containing a SKILL.md file and runs
 * `npx skills add <path>` for each. Skips skills already installed.
 *
 * Usage:
 *   pnpm skills:install          Install all skills
 *   pnpm skills:install --force  Re-install even if already present
 */
import { existsSync, readdirSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const skillsDir = resolve(__dirname, "..", "skills")
const force = process.argv.includes("--force") || process.argv.includes("-f")

if (!existsSync(skillsDir)) {
	console.error(`Skills directory not found: ${skillsDir}`)
	process.exit(1)
}

// Find all subdirectories with a SKILL.md
const skillDirs = readdirSync(skillsDir)
	.filter((name) => {
		const fullPath = join(skillsDir, name)
		return (
			statSync(fullPath).isDirectory() && existsSync(join(fullPath, "SKILL.md"))
		)
	})
	.map((name) => join(skillsDir, name))
	.sort()

if (skillDirs.length === 0) {
	console.log("No skills found in skills/")
	process.exit(0)
}

console.log(`Found ${skillDirs.length} skill(s):`)
for (const dir of skillDirs) {
	console.log(`  - ${dir.replace(`${skillsDir}/`, "")}`)
}
console.log()

// Check already-installed skills (collect Source: paths from `npx skills list`)
let installed: string[] = []
try {
	const output = execSync("npx skills list 2>/dev/null", { encoding: "utf-8" })
	installed = output
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.includes("Source:"))
		.map((line) => {
			const match = line.match(/Source:\s*(.*)/)
			return match ? match[1].trim() : ""
		})
		.filter(Boolean)
} catch {
	// skills list might fail if nothing installed yet
}

let installedCount = 0
let skippedCount = 0
let failedCount = 0

for (const dir of skillDirs) {
	const skillName = dir.replace(`${skillsDir}/`, "")

	// Skip if already installed and not forced
	if (!force && installed.some((line) => line.includes(skillName))) {
		console.log(`↳ ${skillName}: already installed, skipping`)
		skippedCount++
		continue
	}

	console.log(`↳ ${skillName}: installing…`)
	try {
		execSync(`npx skills add "${dir}" -y`, {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		})
		console.log(`  ✓ installed`)
		installedCount++
	} catch (err) {
		console.error(`  ✗ failed: ${err instanceof Error ? err.message : err}`)
		failedCount++
	}
}

console.log()
console.log(
	`Done: ${installedCount} installed, ${skippedCount} skipped, ${failedCount} failed`,
)

if (failedCount > 0) process.exit(1)
