import { getLLMText } from "@/lib/get-llm-text"
import { getSource } from "@/source"

export const revalidate = false

export async function GET() {
	const source = await getSource()
	const scan = source.getPages().map(getLLMText)
	const scanned = await Promise.all(scan)

	return new Response(scanned.join("\n\n"))
}
