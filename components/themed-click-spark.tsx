"use client"

import { useTheme } from "next-themes"
import { useCallback, useEffect, useRef } from "react"
import { siteConfig } from "@/site.config"

interface Spark {
	x: number
	y: number
	angle: number
	startTime: number
}

interface ThemedClickSparkProps {
	/** Spark color in dark mode (default: bright accent) */
	darkColor?: string
	/** Spark color in light mode (default: deep accent) */
	lightColor?: string
	sparkSize?: number
	sparkRadius?: number
	sparkCount?: number
	duration?: number
	easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out"
	extraScale?: number
}

/**
 * Global click-spark overlay.
 *
 * Renders a fixed, full-viewport canvas with `pointer-events: none`.
 * Listens for clicks on `document` so sparks appear anywhere on the page.
 * Spark color follows the active theme via `next-themes`.
 */
export default function ThemedClickSpark({
	darkColor = siteConfig.accentColor,
	lightColor = siteConfig.accentColorLight,
	sparkSize = 10,
	sparkRadius = 15,
	sparkCount = 8,
	duration = 400,
	easing = "ease-out",
	extraScale = 1.0,
}: ThemedClickSparkProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const sparksRef = useRef<Spark[]>([])
	const startTimeRef = useRef<number | null>(null)
	const colorRef = useRef<string>(darkColor)

	const { resolvedTheme } = useTheme()

	// Keep colorRef in sync — the animation loop reads from this ref
	// so it picks up theme changes without restarting the rAF cycle.
	useEffect(() => {
		colorRef.current = resolvedTheme === "light" ? lightColor : darkColor
	}, [resolvedTheme, darkColor, lightColor])

	// ─── Resize canvas to viewport ───
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const resizeCanvas = () => {
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
		}

		resizeCanvas()
		window.addEventListener("resize", resizeCanvas)
		return () => window.removeEventListener("resize", resizeCanvas)
	}, [])

	// ─── Easing ───
	const easeFunc = useCallback(
		(t: number) => {
			switch (easing) {
				case "linear":
					return t
				case "ease-in":
					return t * t
				case "ease-in-out":
					return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
				default:
					return t * (2 - t)
			}
		},
		[easing],
	)

	// ─── Animation loop ───
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		let animationId: number

		const draw = (timestamp: number) => {
			if (!startTimeRef.current) {
				startTimeRef.current = timestamp
			}
			ctx.clearRect(0, 0, canvas.width, canvas.height)

			sparksRef.current = sparksRef.current.filter((spark: Spark) => {
				const elapsed = timestamp - spark.startTime
				if (elapsed >= duration) return false

				const progress = elapsed / duration
				const eased = easeFunc(progress)

				const distance = eased * sparkRadius * extraScale
				const lineLength = sparkSize * (1 - eased)

				const x1 = spark.x + distance * Math.cos(spark.angle)
				const y1 = spark.y + distance * Math.sin(spark.angle)
				const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle)
				const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle)

				ctx.strokeStyle = colorRef.current
				ctx.lineWidth = 2
				ctx.beginPath()
				ctx.moveTo(x1, y1)
				ctx.lineTo(x2, y2)
				ctx.stroke()

				return true
			})

			animationId = requestAnimationFrame(draw)
		}

		animationId = requestAnimationFrame(draw)
		return () => cancelAnimationFrame(animationId)
	}, [sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale])

	// ─── Global click listener ───
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			const now = performance.now()
			const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
				x: e.clientX,
				y: e.clientY,
				angle: (2 * Math.PI * i) / sparkCount,
				startTime: now,
			}))
			sparksRef.current.push(...newSparks)
		}

		document.addEventListener("click", handleClick)
		return () => document.removeEventListener("click", handleClick)
	}, [sparkCount])

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed inset-0 z-[9999]"
		/>
	)
}
