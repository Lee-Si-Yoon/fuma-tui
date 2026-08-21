import { readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * Read an SVG file from public/ and inline it for `dangerouslySetInnerHTML`.
 *
 * - Strips width/height attributes ONLY from the root <svg> tag so the
 *   container controls sizing via CSS. Inner elements (mask rects, cursor
 *   blocks, shapes with explicit dimensions) keep their own width/height.
 * - Injects width="100%" height="100%" on the root <svg> so it fills its parent.
 * - Preserves all fill attributes as-is. SVGs that want to follow CSS `color`
 *   should use `fill="currentColor"` in the source file itself; explicit colors
 *   (`#fff`, `#2A62DB`, etc.) are kept untouched so multi-color logos render
 *   correctly.
 *
 * Returns null if the file doesn't exist or can't be read.
 */
export function loadSvgMark(src: string): string | null {
	// Strip leading slash: "/f.svg" → "f.svg"
	const relPath = src.replace(/^\//, "")
	const absPath = join(process.cwd(), "public", relPath)

	try {
		const raw = readFileSync(absPath, "utf-8")
		return (
			raw
				// Strip width/height ONLY from the root <svg> opening tag.
				// Inner elements (mask rects, cursor blocks, etc.) must keep
				// their own width/height for correct rendering.
				.replace(/<svg([^>]*?)\swidth="[^"]*"/g, "<svg$1")
				.replace(/<svg([^>]*?)\sheight="[^"]*"/g, "<svg$1")
				// Ensure the svg scales to fill its container
				.replace(/<svg/g, '<svg width="100%" height="100%"')
		)
	} catch {
		return null
	}
}
