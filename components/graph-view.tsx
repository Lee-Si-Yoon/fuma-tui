"use client"
import { forceCollide, forceLink, forceManyBody } from "d3-force"
import { useRouter } from "fumadocs-core/framework"
import {
	lazy,
	type RefObject,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import type {
	ForceGraphMethods,
	ForceGraphProps,
	LinkObject,
	NodeObject,
} from "react-force-graph-2d"
import { siteConfig } from "@/site.config"

export interface Graph {
	links: Link[]
	nodes: Node[]
}

export type Node = NodeObject<NodeType>
export type Link = LinkObject<NodeType, LinkType>

export interface NodeType {
	text: string
	description?: string
	neighbors?: string[]
	url: string
}

export type LinkType = Record<string, unknown>

export interface GraphViewProps {
	graph: Graph
}

const ForceGraph2D = lazy(
	() => import("react-force-graph-2d"),
) as typeof import("react-force-graph-2d").default

// Minimap dimensions
const MINIMAP_W = 150
const MINIMAP_H = 110
const MINIMAP_PAD = 8

export function GraphView(props: GraphViewProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [mount, setMount] = useState(false)
	useEffect(() => {
		setMount(true)
	}, [])

	return (
		<div
			ref={ref}
			className="relative h-[min(60dvh,50rem)] overflow-hidden border bg-fd-background"
		>
			{mount && <ClientOnly {...props} containerRef={ref} />}
		</div>
	)
}

/** Viewport state tracked from the main graph for minimap rendering. */
interface Viewport {
	/** Top-left world coord visible at canvas (0,0) */
	tx: number
	ty: number
	/** World units visible per screen pixel */
	k: number
	/** Canvas dimensions of the main graph */
	width: number
	height: number
}

function ClientOnly({
	containerRef,
	graph,
}: GraphViewProps & { containerRef: RefObject<HTMLDivElement | null> }) {
	const graphRef = useRef<ForceGraphMethods<Node, Link> | undefined>(undefined)
	const hoveredRef = useRef<Node | null>(null)
	const zoomedRef = useRef(false)
	const router = useRouter()
	const [tooltip, setTooltip] = useState<{
		x: number
		y: number
		content: string
	} | null>(null)
	const [viewport, setViewport] = useState<Viewport | null>(null)
	const minimapRef = useRef<HTMLCanvasElement>(null)

	const handleNodeHover = (node: Node | null) => {
		const g = graphRef.current
		if (!g) return
		hoveredRef.current = node

		if (node) {
			const coords = g.graph2ScreenCoords(node.x!, node.y!)
			setTooltip({
				x: coords.x + 4,
				y: coords.y + 4,
				content: node.description ?? "No description",
			})
		} else {
			setTooltip(null)
		}
	}

	// Custom node rendering: circle with text label below
	const nodeCanvasObject: ForceGraphProps["nodeCanvasObject"] = (node, ctx) => {
		const container = containerRef.current
		if (!container) return
		const style = getComputedStyle(container)
		const fontSize = 14
		const radius = 5

		// Draw circle
		ctx.beginPath()
		ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false)

		const hoverNode = hoveredRef.current
		const isActive =
			hoverNode?.id === node.id ||
			hoverNode?.neighbors?.includes(node.id as string)

		ctx.fillStyle = isActive
			? style.getPropertyValue("--color-fd-primary")
			: style.getPropertyValue("--terminal-fg-muted")
		ctx.fill()

		// Draw text below the node
		ctx.font = `${fontSize}px Sans-Serif`
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillStyle = getComputedStyle(container).getPropertyValue("color")
		ctx.fillText(node.text, node.x!, node.y! + radius + fontSize)
	}

	const linkColor = (link: Link) => {
		const container = containerRef.current
		if (!container) return "#999"
		const style = getComputedStyle(container)
		const hoverNode = hoveredRef.current

		if (
			hoverNode &&
			typeof link.source === "object" &&
			typeof link.target === "object" &&
			(hoverNode.id === link.source.id || hoverNode.id === link.target.id)
		) {
			return style.getPropertyValue("--color-fd-primary")
		}

		return `color-mix(in oklab, ${style.getPropertyValue("--color-fd-muted-foreground")} 50%, transparent)`
	}

	// Enrich nodes with neighbors for hover effects
	const enrichedNodes = useMemo(() => {
		const { nodes, links } = structuredClone(graph)
		for (const node of nodes) {
			node.neighbors = links.flatMap((link) => {
				if (link.source === node.id) return link.target as string
				if (link.target === node.id) return link.source as string
				return []
			})
		}

		return {
			nodes,
			links,
		}
	}, [graph])

	// Track viewport changes for the minimap
	const onZoom = ({ k, x, y }: { k: number; x: number; y: number }) => {
		const container = containerRef.current
		if (!container) return
		const { clientWidth: width, clientHeight: height } = container
		// react-force-graph pan: x/y are the world coords at canvas center.
		// World coord at canvas (0,0) = x - (width/2) / k
		setViewport({
			k,
			tx: x - width / 2 / k,
			ty: y - height / 2 / k,
			width,
			height,
		})
	}

	// Draw the minimap whenever viewport or graph data changes
	useEffect(() => {
		const canvas = minimapRef.current
		const g = graphRef.current
		if (!canvas || !g || !viewport) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		const { nodes } = enrichedNodes

		// Find graph bounding box
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity
		for (const n of nodes) {
			if (n.x == null || n.y == null) continue
			minX = Math.min(minX, n.x)
			minY = Math.min(minY, n.y)
			maxX = Math.max(maxX, n.x)
			maxY = Math.max(maxY, n.y)
		}
		// Guard against degenerate (single-node or all-same-coord) graphs
		const graphW = Math.max(maxX - minX, 1)
		const graphH = Math.max(maxY - minY, 1)

		// Scale to fit minimap (with padding)
		const availW = MINIMAP_W - MINIMAP_PAD * 2
		const availH = MINIMAP_H - MINIMAP_PAD * 2
		const scale = Math.min(availW / graphW, availH / graphH)

		// Clear
		ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H)

		// World → minimap coord transform
		const w2m = (wx: number, wy: number) => ({
			x: MINIMAP_PAD + (wx - minX) * scale,
			y: MINIMAP_PAD + (wy - minY) * scale,
		})

		// Draw links
		const container = containerRef.current
		if (!container) return
		const style = getComputedStyle(container)
		const linkCol = `color-mix(in oklab, ${style.getPropertyValue("--color-fd-muted-foreground")} 50%, transparent)`
		ctx.strokeStyle = linkCol
		ctx.lineWidth = 0.5
		const { links } = enrichedNodes
		ctx.beginPath()
		for (const link of links) {
			const s =
				typeof link.source === "object"
					? link.source
					: nodes.find((n) => n.id === link.source)
			const t =
				typeof link.target === "object"
					? link.target
					: nodes.find((n) => n.id === link.target)
			if (!s || !t || s.x == null || s.y == null || t.x == null || t.y == null)
				continue
			const sp = w2m(s.x, s.y)
			const tp = w2m(t.x, t.y)
			ctx.moveTo(sp.x, sp.y)
			ctx.lineTo(tp.x, tp.y)
		}
		ctx.stroke()

		// Draw nodes
		const nodeCol = style.getPropertyValue("--terminal-fg-muted") || "#999"
		ctx.fillStyle = nodeCol
		for (const n of nodes) {
			if (n.x == null || n.y == null) continue
			const p = w2m(n.x, n.y)
			ctx.beginPath()
			ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
			ctx.fill()
		}

		// Draw viewport rectangle
		// Main canvas shows: world.x in [viewport.tx, viewport.tx + viewport.width / viewport.k]
		//                   world.y in [viewport.ty, viewport.ty + viewport.height / viewport.k]
		const vpMin = w2m(viewport.tx, viewport.ty)
		const vpMax = w2m(
			viewport.tx + viewport.width / viewport.k,
			viewport.ty + viewport.height / viewport.k,
		)
		const vpW = Math.max(vpMax.x - vpMin.x, 2)
		const vpH = Math.max(vpMax.y - vpMin.y, 2)

		const primary =
			style.getPropertyValue("--color-fd-primary") || siteConfig.accentColor
		ctx.strokeStyle = primary
		ctx.lineWidth = 1.5
		ctx.strokeRect(vpMin.x, vpMin.y, vpW, vpH)
	}, [enrichedNodes, viewport, containerRef])

	return (
		<>
			<ForceGraph2D<NodeType, LinkType>
				ref={{
					get current() {
						return graphRef.current
					},
					set current(fg) {
						graphRef.current = fg
						if (fg) {
							fg.d3Force("link", forceLink().distance(200))
							fg.d3Force("charge", forceManyBody().strength(10))
							fg.d3Force("collision", forceCollide(60))
						}
					},
				}}
				graphData={enrichedNodes}
				nodeCanvasObject={nodeCanvasObject}
				linkColor={linkColor}
				onNodeHover={handleNodeHover}
				onNodeClick={(node) => {
					router.push(node.url)
				}}
				onEngineStop={() => {
					// Fit all nodes into view once the force simulation settles.
					if (graphRef.current && !zoomedRef.current) {
						graphRef.current.zoomToFit(200, 40)
						zoomedRef.current = true
					}
				}}
				onZoom={onZoom}
				linkWidth={2}
				enableNodeDrag
				enableZoomInteraction
			/>
			<button
				type="button"
				onClick={() => graphRef.current?.zoomToFit(200, 40)}
				className="absolute right-3 bottom-3 rounded-md border bg-fd-popover px-3 py-1.5 font-medium text-fd-popover-foreground text-xs shadow-sm transition-colors hover:bg-fd-accent"
			>
				Reset View
			</button>
			{/* Minimap */}
			<canvas
				ref={minimapRef}
				width={MINIMAP_W}
				height={MINIMAP_H}
				className="absolute bottom-3 left-3 hidden rounded-md border bg-fd-popover/80 backdrop-blur-sm md:block"
			/>
			{tooltip && (
				<div
					className="absolute size-fit max-w-xs border bg-fd-popover p-2 text-fd-popover-foreground text-sm shadow-lg"
					style={{ top: tooltip.y, left: tooltip.x }}
				>
					{tooltip.content}
				</div>
			)}
		</>
	)
}
