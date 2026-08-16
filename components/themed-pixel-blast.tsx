"use client"

import { useTheme } from "next-themes"
import type { ComponentProps } from "react"
import { useEffect, useState } from "react"
import PixelBlast from "@/components/react-bits/pixel-blast"
import { siteConfig } from "@/site.config"

type Props = Omit<ComponentProps<typeof PixelBlast>, "color"> & {
	/** Pixel color in dark mode */
	darkColor?: string
	/** Pixel color in light mode */
	lightColor?: string
	/** Inline SVG markup for the centered brand mark. fill must be currentColor. */
	logoMark?: string | null
	/** Alt text for the brand mark. */
	logoMarkAlt?: string
}

export default function ThemedPixelBlast({
	darkColor,
	lightColor,
	logoMark,
	logoMarkAlt,
	...rest
}: Props) {
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const isLight = mounted && resolvedTheme === "light"

	// THREE.Color ignores rgba alpha — apply opacity via CSS on the canvas wrapper.
	const pixelOpacity = isLight
		? siteConfig.theme.pixelOpacityLight
		: siteConfig.theme.pixelOpacityDark
	const pixelColor = (isLight ? lightColor : darkColor) ?? siteConfig.accentColor
	const logoColor = isLight
		? siteConfig.theme.logoColorLight
		: siteConfig.theme.logoColorDark

	return (
		// On mobile, the sidebar grid track (minmax(min-content, 1fr)) can eat all
		// available width, collapsing the main area to 0. fixed breaks out of the grid.
		<div className="relative h-dvh w-full max-md:fixed max-md:inset-0 max-md:z-0">
			{/* CSS opacity on the canvas — THREE.Color strips rgba alpha in the shader. */}
			<div style={{ opacity: pixelOpacity }} className="h-full w-full">
				<PixelBlast color={pixelColor} {...rest} />
			</div>
			{/* Centered brand mark — inline SVG from siteConfig.logoMark.src */}
			{logoMark && (
				<div
					className="pointer-events-none absolute inset-0 flex items-center justify-center"
					style={{ color: logoColor }}
				>
					<div
						style={{
							width: siteConfig.logoMark?.size ?? "8rem",
							height: siteConfig.logoMark?.size ?? "8rem",
						}}
						role="img"
						aria-label={logoMarkAlt}
						// dangerouslySetInnerHTML: SVG loaded at build time from public/, fill replaced with currentColor
						dangerouslySetInnerHTML={{ __html: logoMark }}
					/>
				</div>
			)}
			{/* "Click around" hint — same color as the logo */}
			<div
				className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center"
				style={{ color: logoColor }}
			>
				<span className="animate-pulse text-sm">click around</span>
			</div>
		</div>
	)
}
