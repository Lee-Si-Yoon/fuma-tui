"use client"

import { useTheme } from "next-themes"
import type { ComponentProps } from "react"
import { useEffect, useState } from "react"
import BorderGlow from "@/components/react-bits/border-glow"
import { hexToRgb, siteConfig } from "@/site.config"

type Props = Omit<
	ComponentProps<typeof BorderGlow>,
	"colors" | "glowColor" | "backgroundColor" | "boxShadow"
> & {
	/** Glow color in dark mode (HSL "H S L") */
	darkGlowColor?: string
	/** Glow color in light mode (HSL "H S L") */
	lightGlowColor?: string
	/** Background color in dark mode */
	darkBackgroundColor?: string
	/** Background color in light mode */
	lightBackgroundColor?: string
	/** Mesh gradient colors in dark mode */
	darkColors?: [string, string, string]
	/** Mesh gradient colors in light mode */
	lightColors?: [string, string, string]
	/** Box shadow in dark mode (defaults to subtle black) */
	darkBoxShadow?: string
	/** Box shadow in light mode (defaults to accent-tinted) */
	lightBoxShadow?: string
}

export default function ThemedBorderGlow({
	darkGlowColor,
	lightGlowColor,
	darkBackgroundColor = siteConfig.theme.cardDark,
	lightBackgroundColor = siteConfig.theme.cardLight,
	darkColors,
	lightColors,
	darkBoxShadow,
	lightBoxShadow,
	...rest
}: Props) {
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const isLight = mounted && resolvedTheme === "light"

	// Derive HSL glow color from siteConfig.accentColor
	const hexToHsl = (hex: string): string => {
		const { r: rr, g: gg, b: bb } = hexToRgb(hex)
		const r = rr / 255
		const g = gg / 255
		const b = bb / 255
		const max = Math.max(r, g, b),
			min = Math.min(r, g, b)
		let hue = 0
		const delta = max - min
		if (delta !== 0) {
			if (max === r) hue = ((g - b) / delta) % 6
			else if (max === g) hue = (b - r) / delta + 2
			else hue = (r - g) / delta + 4
			hue = Math.round(hue * 60)
			if (hue < 0) hue += 360
		}
		const lightness = (max + min) / 2
		const sat = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
		return `${hue} ${Math.round(sat * 100)} ${Math.round(lightness * 100)}`
	}

	const defaultDarkGlow = hexToHsl(siteConfig.accentColor)
	const defaultLightGlow = hexToHsl(siteConfig.accentColorLight)
	const defaultDarkColors: [string, string, string] = [
		siteConfig.accentColor,
		siteConfig.accentColor,
		siteConfig.accentColor,
	]
	const defaultLightColors: [string, string, string] = [
		siteConfig.accentColorLight,
		siteConfig.accentColorLight,
		siteConfig.accentColorLight,
	]

	const { r, g, b } = hexToRgb(siteConfig.accentColor)
	const defaultDarkShadow =
		"rgba(0,0,0,0.06) 0 1px 2px, rgba(0,0,0,0.06) 0 2px 4px, rgba(0,0,0,0.06) 0 4px 8px, rgba(0,0,0,0.06) 0 8px 16px"
	const defaultLightShadow = `rgba(${r},${g},${b},0.25) 0 1px 3px, rgba(${r},${g},${b},0.15) 0 2px 6px, rgba(${r},${g},${b},0.10) 0 4px 12px, rgba(${r},${g},${b},0.06) 0 8px 24px`

	return (
		<BorderGlow
			glowColor={
				isLight
					? (lightGlowColor ?? defaultLightGlow)
					: (darkGlowColor ?? defaultDarkGlow)
			}
			backgroundColor={isLight ? lightBackgroundColor : darkBackgroundColor}
			colors={
				isLight
					? (lightColors ?? defaultLightColors)
					: (darkColors ?? defaultDarkColors)
			}
			boxShadow={
				isLight
					? (lightBoxShadow ?? defaultLightShadow)
					: (darkBoxShadow ?? defaultDarkShadow)
			}
			{...rest}
		/>
	)
}
