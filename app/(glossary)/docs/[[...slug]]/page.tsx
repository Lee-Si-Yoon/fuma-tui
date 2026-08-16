import * as ObsidianComponents from "fumadocs-obsidian/ui"
import { DocsBody, DocsPage } from "fumadocs-ui/layouts/docs/page"
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
	Callout as ObsidianCallout,
	ObsidianCalloutBody,
	ObsidianCalloutTitle,
} from "@/components/callout"
import { FrontmatterMeta } from "@/components/frontmatter-meta"
import { GraphView } from "@/components/graph-view"
import { Mermaid } from "@/components/mermaid"
import { NeighbourNav } from "@/components/neighbour-nav"
import ThemedDecryptedText from "@/components/themed-decrypted-text"
import ThemedPixelBlast from "@/components/themed-pixel-blast"
import { buildGraph } from "@/lib/build-graph"
import { loadSvgMark } from "@/lib/load-svg-mark"
import { getNeighbours } from "@/lib/page-tree"
import { siteConfig } from "@/site.config"
import { getPageImageUrl, getSource } from "@/source"
export async function generateStaticParams() {
	const source = await getSource()
	const pages = source.getPages()
	return pages.map((page) => ({ slug: page.slugs }))
}
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
	const { slug = [] } = await params
	const source = await getSource()
	const page = source.getPage(slug)
	if (!page) notFound()
	return {
		title: page.data.title,
		description: page.data.description,
		openGraph: {
			images: getPageImageUrl(page).url,
		},
	}
}
export default async function Page({
	params,
}: {
	params: Promise<{ slug?: string[] }>
}) {
	const { slug = [] } = await params
	const source = await getSource()
	const page = source.getPage(slug)
	if (!page) notFound()
	const { body } = await page.data.load().then((md) =>
		md.render({
			...defaultMdxComponents,
			...ObsidianComponents,
			Mermaid,
			ObsidianCallout,
			ObsidianCalloutBody,
			ObsidianCalloutTitle,
			a: createRelativeLink(source, page),
		}),
	)
	const fm = page.data.frontmatter as Record<string, unknown>
	const { previous, next } = getNeighbours(source, page.url)
	const isHomePage = page.url === "/docs/home"
	const isReadmePage = page.url === "/docs/readme"
	const isGraphPage = page.url === "/docs/table-of-contents"
	if (isHomePage) {
		const svgMark = siteConfig.logoMark?.src
			? loadSvgMark(siteConfig.logoMark.src)
			: null
		return (
			<ThemedPixelBlast
				variant="square"
				pixelSize={4}
				patternScale={2}
				patternDensity={1}
				pixelSizeJitter={0}
				enableRipples
				rippleSpeed={0.3}
				rippleThickness={0.1}
				rippleIntensityScale={1}
				liquid={false}
				speed={0.5}
				edgeFade={0}
				noiseAmount={0}
				transparent={true}
				logoMark={svgMark}
				logoMarkAlt={siteConfig.logoMark?.alt ?? siteConfig.name}
			/>
		)
	}
	return (
		<DocsPage footer={{ enabled: false }}>
			{isReadmePage && siteConfig.readmeBrandText && (
				<div
					className="relative flex flex-0.5 items-center justify-end py-12"
					dir="rtl"
				>
					<ThemedDecryptedText
						text={siteConfig.readmeBrandText}
						animateOn="inViewHover"
						sequential
						revealDirection="start"
						speed={60}
						maxIterations={8}
						parentClassName="break-all text-[clamp(3.75rem,1rem+8vw,8rem)] tracking-wide"
					/>
				</div>
			)}
			<DocsBody>{body}</DocsBody>
			{isGraphPage && (
				<div className="mt-2">
					<GraphView graph={buildGraph(source)} />
				</div>
			)}
			{!isReadmePage && <FrontmatterMeta frontmatter={fm} />}
			<NeighbourNav previous={previous} next={next} />
		</DocsPage>
	)
}
