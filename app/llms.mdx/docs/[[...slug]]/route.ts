import { notFound } from "next/navigation"
import { getLLMText } from "@/lib/get-llm-text"
import { getSource } from "@/source"
export const revalidate = false

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ slug?: string[] }> },
) {
	const { slug = [] } = await params
	const source = await getSource()
	const page = source.getPage(slug)
	if (!page) notFound()

	return new Response(await getLLMText(page), {
		headers: {
			"Content-Type": "text/markdown",
		},
	})
}

export async function generateStaticParams() {
	const source = await getSource()
	return source.getPages().map((page) => ({
		slug: page.slugs,
	}))
}
