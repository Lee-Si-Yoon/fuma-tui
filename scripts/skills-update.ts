#!/usr/bin/env tsx
/**
 * Update all project skills to their latest versions.
 *
 * Runs `npx skills update -y` which updates all project-installed skills
 * from their sources. For local-path skills (no upstream repo), this
 * re-syncs from the local directory.
 *
 * Usage:
 *   pnpm skills:update   Update all installed skills
 */
import { execSync } from "node:child_process"

console.log("Updating all project skills…\n")

try {
	execSync("npx skills update -y", { stdio: "inherit" })
	console.log("\n✓ All skills updated.")
} catch (err) {
	console.error("\n✗ Update failed:", err instanceof Error ? err.message : err)
	process.exit(1)
}
