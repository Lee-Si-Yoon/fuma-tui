import "@/app/global.css"
import { RootProvider } from "fumadocs-ui/provider/next"
import { JetBrains_Mono, VT323 } from "next/font/google"
import type { ReactNode } from "react"
import ThemedClickSpark from "@/components/themed-click-spark"
import { accentThemeVars, siteConfig } from "@/site.config"

export const metadata = {
	title: siteConfig.name,
	description: siteConfig.description,
	metadataBase: new URL(
		process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: `http://localhost:${process.env.PORT ?? 3000}`,
	),
	...(siteConfig.favicon?.src
		? {
				icons: {
					icon: siteConfig.favicon.src,
					shortcut: siteConfig.favicon.src,
				},
			}
		: {}),
}

const vt323 = VT323({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-pixel",
	display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
})

export default async function RootLayout({
	children,
}: {
	children: ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<style dangerouslySetInnerHTML={{ __html: accentThemeVars() }} />
			</head>
			<body className={`${vt323.variable} ${jetbrainsMono.variable}`}>
				<RootProvider
					theme={{
						enableSystem: true,
						defaultTheme: "system",
						themes: ["light", "dark"],
					}}
					search={{
						options: { type: "static", api: "/api/search" },
					}}
				>
					{children}
					<ThemedClickSpark />
				</RootProvider>
			</body>
		</html>
	)
}
