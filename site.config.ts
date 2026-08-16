/**
 * Central site configuration. Edit this file to rebrand the entire site.
 *
 * After cloning the template:
 * 1. Change the values below
 * 2. Drop your SVGs in public/ and set logo.src / logoMark.src / favicon.src
 *    (plus optional srcLight variants for light mode)
 *
 * That's it. The accent color and all its variants (dim, muted, borders,
 * scrollbars, scanlines, box-shadows) are derived automatically from
 * accentColor. No manual CSS sync needed.
 */
export const siteConfig = {
	/**
	 * Site name. Shows up in the browser tab title, OG image metadata,
	 * and the sidebar's root label in the page tree.
	 */
	name: "fuma-tui",

	/**
	 * Short description used in meta tags and OG images.
	 * Keep it to one sentence.
	 */
	description:
		"The TUI-styled documentation template for your Obsidian vault.",

	/**
	 * GitHub repo owner. Used to build the sidebar GitHub link
	 * and contributor profile URLs.
	 */
	repoOwner: "Lee-Si-Yoon",

	/**
	 * GitHub repo name. Combined with repoOwner to form the full URL.
	 */
	repoName: "fuma-tui",

	/** Full GitHub URL. Derived from repoOwner + repoName. Don't edit. */
	get githubUrl(): string {
		return `https://github.com/${this.repoOwner}/${this.repoName}`
	},

	/**
	 * Package name. Shows in the OG image top bar as "packageName — Page Title".
	 * Also the `name` field in package.json.
	 */
	packageName: "fuma-tui",

	/**
	 * Primary accent color as a hex string (no alpha).
	 * Drives every accent-colored element: links, buttons, graph nodes,
	 * click sparks, border glow, DecryptedText, OG images, scrollbars,
	 * scanlines, box-shadows, borders. All variants (dim, muted, etc.)
	 * are derived automatically — you only set this one value.
	 */
	accentColor: "#0095ff",

	/**
	 * Accent color for light mode. Usually a slightly brighter shade
	 * for better contrast on white. Set to the same hex as accentColor
	 * if you want both themes to use the same accent.
	 */
	accentColorLight: "#0095ff",

	/**
	 * Sidebar logo (wordmark). Rendered inline (SVG markup injected via
	 * dangerouslySetInnerHTML) in the nav title so it inherits CSS `color`
	 * and supports multi-color paths (use `fill="currentColor"` for
	 * theme-following parts, explicit hex for fixed-color parts).
	 *
	 * - src: path to the dark-mode SVG file in public/. Set to null to use
	 *   siteConfig.name as text instead.
	 * - srcLight: optional path to a light-mode SVG. Falls back to `src`
	 *   when null/undefined — use this only if your logo needs different
	 *   shapes or colors per theme. The dark variant is shown during SSR
	 *   and until the client resolves the theme (no FOUC).
	 * - alt: alt text for screen readers.
	 * - height: CSS height (e.g. "2rem", "32px").
	 */
	logo: {
		/** Set to "/logo.svg" after replacing the file in public/. null = use siteConfig.name as text. */
		src: "/fuma-tui-logotype.svg",
		/** Light-mode variant. Omit / set to null to reuse `src` for both themes. */
		srcLight: "/fuma-tui-logotype-light.svg",
		alt: "fuma-tui",
		height: "2rem",
	},

	/**
	 * Home page logo mark (symbol/icon). Rendered centered on the
	 * PixelBlast landing page. This is the square symbol, not the
	 * wordmark. If null, no symbol is shown.
	 *
	 * - src: path to the dark-mode SVG file in public/.
	 * - srcLight: optional light-mode variant; falls back to `src`.
	 * - alt: alt text for screen readers.
	 * - size: CSS size for both width and height (e.g. "8rem").
	 */
	logoMark: {
		/** Set to "/logo-mark.svg" after replacing the file in public/. null = hide symbol. */
		src: "/fuma-tui-symbol.svg",
		/** Light-mode variant. Omit / set to null to reuse `src` for both themes. */
		srcLight: "/fuma-tui-symbol-light.svg",
		alt: "fuma-tui",
		size: "24rem",
	},

	/**
	 * Favicon. Referenced via metadata.icons in the root layout.
	 * Set src to null to use Next.js's app/icon.svg file convention instead.
	 */
	favicon: {
		/** Set to "/favicon.svg" after replacing the file in public/. null = use app/icon.svg convention. */
		src: "/favicon.svg",
	},

	/**
	 * Brand text for the README page's DecryptedText animation.
	 * Set to your brand or product name. Empty string skips the animation.
	 */
	readmeBrandText: "fuma-tui",

	/** Brand text in the OG image bottom row (next to the book icon). */
	ogBrandText: "fuma-tui",

	/**
	 * Sidebar banner — the ThemedBorderGlow card at the bottom of the
	 * sidebar. Set `enabled` to false to hide it entirely.
	 *
	 * - enabled: show or hide the banner.
	 * - title: bold heading shown inside the card.
	 * - description: secondary subtext beneath the title.
	 * - href: URL opened on click. Set to null for a non-clickable banner
	 *   (renders a <div> instead of an <a>).
	 */
	sidebarBanner: {
		/** Show or hide the sidebar banner card. */
		enabled: true,
		/** Bold heading shown inside the card. */
		title: "Interested in contributing?",
		/** Secondary subtext shown beneath the title. */
		description: "Click here to get started →",
		/** Link opened on click. null = non-clickable banner (no <a>). */
		href: "https://github.com/Lee-Si-Yoon/fuma-tui",
	},

	/**
	 * Theme palette — base backgrounds, surfaces, and text colors used by
	 * themed components and the OG image. Override only if you want a
	 * palette that doesn't match the default terminal aesthetic.
	 */
	theme: {
		/** Card background in dark mode (BorderGlow, panels). */
		cardDark: "#1e2433",
		/** Card background in light mode. */
		cardLight: "#e5e8ee",
		/** Logo mark color in dark mode (PixelBlast centered symbol). */
		logoColorDark: "#d6edff",
		/** Logo mark color in light mode. Defaults to accentColorLight. */
		get logoColorLight(): string {
			return siteConfig.accentColorLight
		},
		/**
		 * PixelBlast pixel opacity per theme (0–1). Lower = more subtle.
		 * Used by ThemedPixelBlast to derive the default pixel color.
		 */
		pixelOpacityDark: 0.2,
		pixelOpacityLight: 0.4,
		/** OG image background (Satori can't read CSS variables). */
		ogBackground: "#0a0d12",
		/** OG image foreground text. */
		ogForeground: "#d1d5db",
		/** OG image description text (dimmed foreground). */
		ogForegroundDim: "rgba(209,213,219,0.7)",
	},

	/**
	 * OG image accent colors. Derived from accentColor automatically.
	 * Satori (next/og) can't read CSS variables, so these are computed
	 * as plain hex/rgba strings at render time. Override the getters
	 * only if you need colors that don't match accentColor.
	 */
	og: {
		get accent(): string {
			return siteConfig.accentColor
		},
		get accentDim(): string {
			const { r, g, b } = hexToRgb(siteConfig.accentColor)
			return `rgba(${r}, ${g}, ${b}, 0.7)`
		},
		get accentMuted(): string {
			const { r, g, b } = hexToRgb(siteConfig.accentColor)
			return `rgba(${r}, ${g}, ${b}, 0.15)`
		},
	},
} as const

/** Parse a #rrggbb hex string into { r, g, b } integers. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const h = hex.replace("#", "")
	return {
		r: parseInt(h.slice(0, 2), 16),
		g: parseInt(h.slice(2, 4), 16),
		b: parseInt(h.slice(4, 6), 16),
	}
}

/**
 * Generate CSS custom properties for the accent color system.
 * Inject these via a <style> tag in the root layout. All accent-derived
 * values in global.css reference these variables, so changing accentColor
 * here automatically updates every accent-colored element.
 *
 * Exposes:
 *   --accent-r, --accent-g, --accent-b  (integers, for rgb(r g b / a) syntax)
 *
 * Dark theme uses accentColor. Light theme overrides with accentColorLight.
 */
export function accentThemeVars(): string {
	const dark = hexToRgb(siteConfig.accentColor)
	const light = hexToRgb(siteConfig.accentColorLight)

	return [
		`:root{--accent-r:${dark.r};--accent-g:${dark.g};--accent-b:${dark.b};--accent:rgb(var(--accent-r) var(--accent-g) var(--accent-b));--accent-dim:rgb(var(--accent-r) var(--accent-g) var(--accent-b)/0.7);--accent-muted:rgb(var(--accent-r) var(--accent-g) var(--accent-b)/0.5)}`,
		`.light{--accent-r:${light.r};--accent-g:${light.g};--accent-b:${light.b}}`,
	].join("")
}
