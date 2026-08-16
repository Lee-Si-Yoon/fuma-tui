import { ObsidianCalloutBody, ObsidianCalloutTitle } from "fumadocs-obsidian/ui"
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

const iconClass = "size-5 -me-0.5 fill-(--callout-color) text-fd-card"

// Map Obsidian callout types to our 4 supported types.
type CalloutType = "info" | "warning" | "error" | "success"

const typeMap: Record<string, CalloutType> = {
	info: "info",
	note: "info",
	tip: "success",
	success: "success",
	warning: "warning",
	warn: "warning",
	danger: "error",
	error: "error",
	failure: "error",
	fail: "error",
}

export function Callout({
	className,
	type = "info",
	children,
	style,
	...props
}: {
	className?: string
	type?: string
	children?: ReactNode
	style?: CSSProperties
} & Omit<React.HTMLAttributes<HTMLDivElement>, "type" | "children">) {
	const resolved = typeMap[type ?? "info"] ?? "info"

	return (
		<div
			className={`my-4 flex gap-2 bg-fd-card p-3 ps-1 text-fd-card-foreground text-sm ${className ?? ""}`}
			{...props}
			style={
				{
					"--callout-color": `var(--color-fd-${resolved}, var(--color-fd-muted))`,
					...style,
				} as CSSProperties
			}
		>
			<div role="none" className="w-0.5 rounded-sm bg-(--callout-color)/50" />
			{
				{
					info: <Info className={iconClass} />,
					warning: <TriangleAlert className={iconClass} />,
					error: <CircleAlert className={iconClass} />,
					success: <CircleCheck className={iconClass} />,
				}[resolved]
			}
			<div className="flex min-w-0 flex-1 flex-col gap-2">{children}</div>
		</div>
	)
}

export { Callout as ObsidianCallout, ObsidianCalloutBody, ObsidianCalloutTitle }
