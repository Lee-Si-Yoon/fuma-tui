import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { displayName } from "@/lib/page-tree"

type Page = { data: { title: string }; url: string }

interface NeighbourNavProps {
	previous?: Page
	next?: Page
}

export function NeighbourNav({ previous, next }: NeighbourNavProps) {
	if (!previous && !next) return null

	return (
		<nav className="mt-2 flex items-center gap-4 border-fd-border border-t pt-6">
			{previous ? (
				<Link
					href={previous.url}
					className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-fd-muted-foreground text-sm transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground"
				>
					<ChevronLeft className="size-4 shrink-0" />
					<span className="truncate">{displayName(previous.data.title)}</span>
				</Link>
			) : (
				<span className="flex-1" />
			)}
			{previous && next && (
				<span className="select-none text-fd-muted-foreground/40">|</span>
			)}
			{next ? (
				<Link
					href={next.url}
					className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-fd-muted-foreground text-sm transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground"
				>
					<span className="truncate">{displayName(next.data.title)}</span>
					<ChevronRight className="size-4 shrink-0" />
				</Link>
			) : null}
		</nav>
	)
}
