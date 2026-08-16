"use client"

import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { useEffect, useState } from "react"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

interface FrontmatterMetaProps {
	frontmatter: Record<string, unknown>
}

function fmt(v: unknown): string {
	if (v === undefined || v === null) return ""
	if (Array.isArray(v)) return v.join(", ")
	return String(v)
}

const META_FIELDS = [
	"created_by",
	"created_at",
	"last_updated_by",
	"last_updated_at",
	"parent",
	"description",
] as const

/** Fields whose values are RFC 3339 timestamps — rendered in the viewer's local timezone. */
const TIMESTAMP_FIELDS = new Set(["created_at", "last_updated_at"])

const PARSE_FORMATS = [
	"YYYY-MM-DDTHH:mm:ssZ",
	"YYYY-MM-DDTHH:mm:ss.SSSZ",
	"YYYY-MM-DD",
]

/**
 * Convert a UTC RFC 3339 timestamp (or bare date) to the viewer's local
 * timezone, formatted as RFC 3339 with numeric offset (e.g. 2026-08-12T09:00:00+09:00).
 * Returns null when the input can't be parsed.
 */
function toLocalRFC3339(v: string): string | null {
	const d = dayjs(v, PARSE_FORMATS, true)
	if (!d.isValid()) return null

	// dayjs.tz.guess() picks up the browser's local timezone
	const local = d.tz(dayjs.tz.guess())
	return local.format("YYYY-MM-DDTHH:mm:ssZ")
}

/**
 * Render frontmatter metadata as a visible block — like nvim shows it.
 * Timestamps are converted from UTC to the viewer's local timezone (RFC 3339 with offset).
 */
export function FrontmatterMeta({ frontmatter }: FrontmatterMetaProps) {
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])

	const fields = META_FIELDS.filter((k) => frontmatter[k] !== undefined)
	if (fields.length === 0) return null

	const yamlLines: string[] = []
	for (const key of fields) {
		const val = fmt(frontmatter[key])
		if (TIMESTAMP_FIELDS.has(key)) {
			const local = mounted ? toLocalRFC3339(val) : null
			yamlLines.push(`${key}: ${local ?? val}`)
			continue
		}
		const needsQuotes = /[:#]/.test(val) || val.includes(" ")
		yamlLines.push(`${key}: ${needsQuotes ? `"${val}"` : val}`)
	}

	return (
		<pre
			className="fd-frontmatter my-4 overflow-x-hidden border p-4 text-xs leading-relaxed"
			data-label="frontmatter"
		>
			<code>{yamlLines.join("\n")}</code>
		</pre>
	)
}
