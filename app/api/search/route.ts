import { createFromSource } from "fumadocs-core/search/server"
import { getSource } from "@/source"

// Static search mode — the index is built at build time and exported as
// a single JSON blob. The client downloads it once and searches locally,
// so the serverless function doesn't need to re-index at runtime (which
// fails on Vercel because `public/vault` isn't in the function's CWD).
// See https://www.fumadocs.dev/docs/headless/search/orama#static-export
export const revalidate = false

const server = createFromSource(getSource)

export const { staticGET: GET } = server
