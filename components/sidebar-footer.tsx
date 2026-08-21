"use client"

import ThemedBorderGlow from "@/components/themed-border-glow"
import { siteConfig } from "@/site.config"

export default function SidebarFooter() {
	const { enabled, title, description, href } = siteConfig.sidebarBanner

	if (!enabled) return null

	const inner = (
		<>
			<p className="font-medium text-fd-foreground">{title}</p>
			{description ? <p className="mt-0.5 text-xs">{description}</p> : null}
		</>
	)

	return (
		<ThemedBorderGlow
			borderRadius={28}
			glowRadius={28}
			glowIntensity={0.6}
			edgeSensitivity={30}
			coneSpread={25}
			animated={true}
			className="order-first mb-6 min-h-0"
		>
			{href ? (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="block px-4 py-3 text-start text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground"
				>
					{inner}
				</a>
			) : (
				<div className="block px-4 py-3 text-start text-fd-muted-foreground text-sm">
					{inner}
				</div>
			)}
		</ThemedBorderGlow>
	)
}
