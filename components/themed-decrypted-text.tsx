"use client"

import { useTheme } from "next-themes"
import type { ComponentProps } from "react"
import { useEffect, useState } from "react"
import DecryptedText from "@/components/react-bits/decrypted-text"
import { hexToRgb, siteConfig } from "@/site.config"

type Props = Omit<
	ComponentProps<typeof DecryptedText>,
	"className" | "encryptedClassName"
> & {
	/** Text color in dark mode. Defaults to accent-derived. */
	darkColor?: string
	/** Text color in light mode. Defaults to accentColorLight. */
	lightColor?: string
	/** Encrypted character color in dark mode. Defaults to accent at 40% opacity. */
	darkEncryptedColor?: string
	/** Encrypted character color in light mode. Defaults to accentColorLight at 40% opacity. */
	lightEncryptedColor?: string
}

export default function ThemedDecryptedText({
	darkColor,
	lightColor,
	darkEncryptedColor,
	lightEncryptedColor,
	...rest
}: Props) {
	// Derive defaults from accentColor
	const { r, g, b } = hexToRgb(siteConfig.accentColor)
	const { r: rL, g: gL, b: bL } = hexToRgb(siteConfig.accentColorLight)
	const defaultDark = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`
	const defaultLight = siteConfig.accentColorLight
	const defaultDarkEnc = `rgba(${r}, ${g}, ${b}, 0.4)`
	const defaultLightEnc = `rgba(${rL}, ${gL}, ${bL}, 0.4)`
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const isLight = mounted && resolvedTheme === "light"
	const revealedColor = isLight
		? (lightColor ?? defaultLight)
		: (darkColor ?? defaultDark)
	const encryptedColor = isLight
		? (lightEncryptedColor ?? defaultLightEnc)
		: (darkEncryptedColor ?? defaultDarkEnc)

	return (
		<DecryptedText
			className="themed-decrypted-revealed"
			encryptedClassName="themed-decrypted-encrypted"
			style={
				{
					"--decrypted-revealed-color": revealedColor,
					"--decrypted-encrypted-color": encryptedColor,
				} as React.CSSProperties
			}
			{...rest}
		/>
	)
}
