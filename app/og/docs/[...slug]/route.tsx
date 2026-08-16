import { notFound } from "next/navigation"
import { ImageResponse } from "next/og"
import { siteConfig } from "@/site.config"
import { getPageImageUrl, getSource } from "@/source"

export const revalidate = false

/** Dark TUI-styled OG image matching the glossary's terminal aesthetic. */
function OgImage({
	title,
	description,
}: {
	title: string
	description?: string
}) {
	const accent = siteConfig.og.accent
	const accentDim = siteConfig.og.accentDim
	const accentMuted = siteConfig.og.accentMuted

	const dots = [accent, accentDim, accentMuted]

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				backgroundColor: siteConfig.theme.ogBackground,
				color: siteConfig.theme.ogForeground,
				padding: "4rem",
				fontFamily: "monospace",
				borderBottom: `8px solid ${accent}`,
			}}
		>
			{/* Top bar — fake terminal title */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					marginBottom: "2rem",
				}}
			>
				<div style={{ display: "flex", gap: "10px" }}>
					{dots.map((c, i) => (
						<div
							key={`dot-${i}`}
							style={{
								display: "flex",
								width: "16px",
								height: "16px",
								borderRadius: "9999px",
								backgroundColor: c,
							}}
						/>
					))}
				</div>
				<div
					style={{
						display: "flex",
						fontSize: "28px",
						color: accentDim,
						marginLeft: "16px",
					}}
				>
					{`${siteConfig.packageName} — ${title}`}
				</div>
			</div>

			{/* Title */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					fontSize: "72px",
					fontWeight: 700,
					color: accent,
					margin: 0,
					lineHeight: 1.1,
				}}
			>
				{title}
			</div>

			{/* Description */}
			{description ? (
				<div
					style={{
						display: "flex",
						fontSize: "36px",
						color: siteConfig.theme.ogForegroundDim,
						marginTop: "24px",
						paddingTop: "24px",
						borderTop: `4px dashed ${accentMuted}`,
						maxWidth: "85%",
						lineHeight: 1.3,
					}}
				>
					{description}
				</div>
			) : null}

			{/* Bottom row — site name + cursor */}
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					marginTop: "auto",
					paddingTop: "32px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "16px",
						color: accent,
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke={accent}
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
						role="img"
						aria-label={siteConfig.name}
					>
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
					</svg>
					<div
						style={{
							display: "flex",
							fontSize: "40px",
							fontWeight: 600,
							color: accent,
						}}
					>
						{siteConfig.ogBrandText}
					</div>
				</div>
				{/* Terminal cursor */}
				<div style={{ display: "flex", gap: "6px" }}>
					<div
						style={{
							display: "flex",
							width: "16px",
							height: "32px",
							backgroundColor: accent,
							marginLeft: "4px",
						}}
					/>
					<div
						style={{
							display: "flex",
							width: "16px",
							height: "32px",
							backgroundColor: accentMuted,
							marginLeft: "4px",
						}}
					/>
					<div
						style={{
							display: "flex",
							width: "16px",
							height: "32px",
							backgroundColor: accentMuted,
							marginLeft: "4px",
						}}
					/>
				</div>
			</div>
		</div>
	)
}

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ slug: string[] }> },
) {
	const { slug } = await params
	const source = await getSource()
	// Last segment is `image.png` — strip it to get the actual page slug
	const page = source.getPage(slug.slice(0, -1))
	if (!page) notFound()

	return new ImageResponse(
		<OgImage title={page.data.title} description={page.data.description} />,
		{
			width: 1200,
			height: 630,
		},
	)
}

export function generateStaticParams() {
	return getSource().then((source) =>
		source.getPages().map((page) => ({
			slug: getPageImageUrl(page).segments,
		})),
	)
}
