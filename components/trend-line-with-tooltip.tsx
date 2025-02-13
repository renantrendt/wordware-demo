"use client"

import { useRef, useEffect, useState } from "react"
import { format, subDays } from "date-fns"

interface TrendLineWithTooltipProps {
  data: number[]
  color?: string
  height?: number
  width?: number | string
  glowIntensity?: "high" | "medium" | "low"
  animated?: boolean
}

interface TooltipData {
  x: number
  y: number
  value: number
  date: string
  visible: boolean
}

export function TrendLineWithTooltip({
  data = [],
  color = "#FFA066",
  height = 120,
  width = "100%",
  glowIntensity = "medium",
  animated = false,
}: TrendLineWithTooltipProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, value: 0, date: "", visible: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || data.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up the canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate points
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * rect.width,
      y: rect.height - (value / Math.max(...data)) * rect.height * 0.8,
      value,
      date: format(subDays(new Date(), data.length - 1 - index), "MMM d")
    }))

    // Create gradient for the fill
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
    const rgbaColor = color.startsWith("#")
      ? `rgba(${Number.parseInt(color.slice(1, 3), 16)}, ${Number.parseInt(color.slice(3, 5), 16)}, ${Number.parseInt(color.slice(5, 7), 16)}`
      : color.replace("rgb(", "rgba(").replace(")", "")

    gradient.addColorStop(0, `${rgbaColor}, 0.1)`)
    gradient.addColorStop(1, `${rgbaColor}, 0)`)

    const drawLine = (points: Array<{ x: number; y: number }>) => {
      if (points.length === 0) return

      // Draw fill
      ctx.beginPath()
      ctx.moveTo(points[0].x, rect.height)
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, rect.height)
          ctx.lineTo(point.x, point.y)
        } else {
          const prevPoint = points[index - 1]
          const currPoint = point
          const ctrl1 = {
            x: (prevPoint.x + currPoint.x) / 2,
            y: prevPoint.y,
          }
          const ctrl2 = {
            x: (prevPoint.x + currPoint.x) / 2,
            y: currPoint.y,
          }
          ctx.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, currPoint.x, currPoint.y)
        }
      })

      // Complete the fill path
      if (points.length > 0) {
        ctx.lineTo(points[points.length - 1].x, rect.height)
      }
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw the line
      ctx.beginPath()
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          const prevPoint = points[index - 1]
          const currPoint = point
          const ctrl1 = {
            x: (prevPoint.x + currPoint.x) / 2,
            y: prevPoint.y,
          }
          const ctrl2 = {
            x: (prevPoint.x + currPoint.x) / 2,
            y: currPoint.y,
          }
          ctx.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, currPoint.x, currPoint.y)
        }
      })
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    drawLine(points)

    // Handle mouse move for tooltip
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pointWidth = rect.width / (points.length - 1)
      const index = Math.round(x / pointWidth)
      
      if (index >= 0 && index < points.length) {
        const point = points[index]
        setTooltip({
          x: point.x,
          y: point.y,
          value: data[index],
          date: point.date,
          visible: true
        })
      }
    }

    const handleMouseLeave = () => {
      setTooltip(prev => ({ ...prev, visible: false }))
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [data, color])

  return (
    <div ref={containerRef} style={{ position: "relative", width, height }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y - 40,
            transform: "translateX(-50%)",
            backgroundColor: "#1A1A1A",
            border: "1px solid #2F2F2F",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            color: "white",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {tooltip.date}: {tooltip.value} messages
        </div>
      )}
    </div>
  )
}
