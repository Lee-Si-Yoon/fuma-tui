"use client"

import ThemedBorderGlow from "@/components/themed-border-glow"

export default function SidebarFooter() {
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
			<button
				type="button"
				className="block px-4 py-3 text-start text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground"
			>
				<p className="font-medium text-fd-foreground">
					Interested in contributing?
				</p>
				<p className="mt-0.5 text-xs">Click here to get started →</p>
			</button>
		</ThemedBorderGlow>
	)
}
