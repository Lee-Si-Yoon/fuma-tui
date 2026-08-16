# SPEC: Graph View

## Goal

Interactive visual graph of all entries and their wikilink relationships. Rendered on the Table of Contents page.

## Components

### GraphView (`components/graph-view.tsx`)

React component using `react-force-graph-2d` with `d3-force` simulation. Lazy-loaded (`React.lazy`) to keep the initial bundle small.

### buildGraph (`lib/build-graph.ts`)

Builds a `Graph` object from the glossary source:

```ts
interface Graph {
  links: Link[]  // { source: url, target: url }
  nodes: Node[]  // { id: url, url, text: displayName(title), description }
}
```

- Parses `[[Term]]` syntax from raw markdown content (`page.data.content`).
- `titleToUrl` map resolves wikilink targets to page URLs.
- Self-links excluded.
- Node text uses `displayName()` from `lib/page-tree.ts`.

## Rendering

### Node canvas rendering

Custom `nodeCanvasObject` draws each node as:
- Circle (radius 5) with text label below (14px Sans-Serif).
- Active/hovered nodes and their neighbors use `--color-fd-primary` fill.
- Inactive nodes use `--terminal-fg-muted` fill.
- Colors read via `getComputedStyle(container)` on the container element.

### Link colors

- Active links (connected to hovered node) use `--color-fd-primary`.
- Inactive links use `color-mix(in oklab, --color-fd-muted-foreground 50%, transparent)`.

### Hover tooltip

Absolute-positioned div showing `node.description` (or "No description") at cursor position. Positioned via `graphRef.graph2ScreenCoords()`.

### Click navigation

`onNodeClick` calls `router.push(node.url)` to navigate to the clicked entry.

## Force simulation

| Force | Config |
|-------|--------|
| `forceLink` | distance 200 |
| `forceManyBody` | strength 10 |
| `forceCollide` | radius 60 |

Set via a `ref` getter/setter on the `ForceGraph2D` component.

### Auto-fit

On `onEngineStop`, `zoomToFit(200, 40)` is called once (guarded by `zoomedRef`). A "Reset View" button at bottom-right calls the same.

## Minimap

Bottom-left corner, `md:block` (hidden on mobile). Canvas: 150×110px with 8px padding.

- Renders all nodes (1.5px circles) and links (0.5px lines) in reduced scale.
- Scale computed from graph bounding box (`minX/minY/maxX/maxY`).
- Degenerate graphs (single node or all-same-coord) guarded with `Math.max(span, 1)`.
- Viewport rectangle drawn in `--color-fd-primary` showing the currently visible area.
- Updates in real time via `onZoom` handler tracking `k` (zoom), `x/y` (pan center).

### Viewport tracking

`onZoom` converts the pan center (`x`, `y`) to top-left world coords:
```
tx = x - width / 2 / k
ty = y - height / 2 / k
```

### Minimap redraw

Triggered by `useEffect` on `[enrichedNodes, viewport, containerRef]`. Clears canvas, transforms world coords to minimap coords via `w2m()`.

## Node enrichment

`enrichedNodes` (useMemo on `[graph]`): `structuredClone` of graph data, then computes `node.neighbors` from links for hover highlighting. `structuredClone` avoids mutating the original graph data.

## Layout

Container: `h-[60dvh]` on mobile, `h-[800px]` on desktop. `overflow-hidden border bg-fd-background`.

## Dependencies

- `react-force-graph-2d` ^1.29.1 (lazy-loaded)
- `d3-force` ^3.0.0
- `@types/d3-force` ^3.0.10 (dev)

## Constraints

- `structuredClone` requires Node.js 17+ / modern browsers.
- ForceGraph2D is lazy-loaded to avoid loading the canvas+d3-force bundle on non-graph pages.
- Minimap is desktop-only (`hidden md:block`).
- Viewport state (`Viewport` interface) tracks `tx`, `ty`, `k`, `width`, `height`.
