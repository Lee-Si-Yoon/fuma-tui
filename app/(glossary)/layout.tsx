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
	const logoSvg = siteConfig.logo.src ? loadSvgMark(siteConfig.logo.src) : null
	return (
		<DocsLayout
			tree={buildGlossaryTree(source)}
			nav={{
				title: logoSvg ? (
					<span
						style={{ height: siteConfig.logo.height }}
						className="text-[var(--terminal-fg)]"
						role="img"
						aria-label={siteConfig.logo.alt}
						dangerouslySetInnerHTML={{ __html: logoSvg }}
					/>
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
