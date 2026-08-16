import { DocsLayout } from "fumadocs-ui/layouts/docs"
import type { ReactNode } from "react"
import SidebarFooter from "@/components/sidebar-footer"
import { loadSvgMark } from "@/lib/load-svg-mark"
import { buildGlossaryTree } from "@/lib/page-tree"
import { siteConfig } from "@/site.config"
import { getSource } from "@/source"

export default async function DocsLayoutWrapper({
	children,
}: {
	children: ReactNode
}) {
	const source = await getSource()
	const logoDark = siteConfig.logo.src ? loadSvgMark(siteConfig.logo.src) : null
	// srcLight is optional — fall back to the dark SVG so both themes render
	// the same markup (no layout shift, no extra network request). Only load
	// a separate file when the user explicitly configures srcLight.
	const logoLight = siteConfig.logo.srcLight
		? loadSvgMark(siteConfig.logo.srcLight)
		: logoDark
	return (
		<DocsLayout
			tree={buildGlossaryTree(source)}
			nav={{
				title:
					logoDark || logoLight ? (
						<span
							style={{ height: siteConfig.logo.height }}
							className="text-[var(--terminal-fg)]"
							role="img"
							aria-label={siteConfig.logo.alt}
						>
							{logoDark && (
								<span
									className="logo-dark"
									style={{ height: siteConfig.logo.height }}
									dangerouslySetInnerHTML={{ __html: logoDark }}
								/>
							)}
							{logoLight && logoLight !== logoDark && (
								<span
									className="logo-light"
									style={{ height: siteConfig.logo.height }}
									dangerouslySetInnerHTML={{ __html: logoLight }}
								/>
							)}
						</span>
					) : (
						siteConfig.name
					),
				url: "/docs/home",
			}}
			sidebar={{
				footer: <SidebarFooter />,
			}}
			githubUrl={siteConfig.githubUrl}
			themeSwitch={{
				enabled: true,
				mode: "light-dark-system",
			}}
		>
			{children}
		</DocsLayout>
	)
}
