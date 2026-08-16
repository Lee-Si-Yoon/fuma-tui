import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation"
import { type NextRequest, NextResponse } from "next/server"

const { rewrite: rewriteLLM } = rewritePath(
	"/docs{/*path}",
	"/llms.mdx/docs{/*path}",
)

export default async function proxy(request: NextRequest) {
	// Serve Markdown to AI agents via Accept header negotiation
	if (isMarkdownPreferred(request)) {
		const result = rewriteLLM(request.nextUrl.pathname)
		if (result) {
			return NextResponse.rewrite(new URL(result, request.nextUrl), {
				headers: { Vary: "Accept" },
			})
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
