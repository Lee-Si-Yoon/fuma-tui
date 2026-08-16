import { llms } from "fumadocs-core/source"
import { getSource } from "@/source"

export const revalidate = false

export async function GET() {
	const source = await getSource()
	return new Response(llms(source).index())
}
