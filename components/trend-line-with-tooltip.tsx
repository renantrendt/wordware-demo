"use client"

import { useEffect, useState } from "react"
import { TrendLine } from "./trend-line"
import { format, subDays } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TrendLineWithTooltipProps {
  data: number[]
  color: string
  height: number
  width: string | number
}

export function TrendLineWithTooltip({ data = [], color, height, width }: TrendLineWithTooltipProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!data?.length) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const index = Math.floor((x / rect.width) * data.length)
    if (index >= 0 && index < data.length) {
      setHoveredValue(data[index])
      setHoveredIndex(index)
    }
  }

  const handleMouseLeave = () => {
    setHoveredValue(null)
    setHoveredIndex(null)
  }

  return (
    <TooltipProvider>
      <Tooltip open={hoveredValue !== null}>
        <TooltipTrigger asChild>
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ width, height }}
          >
            <TrendLine data={data} color={color} height={height} width={width} />
          </div>
        </TooltipTrigger>
        {hoveredValue !== null && hoveredIndex !== null && (
          <TooltipContent side="top" className="bg-[#1A1A1A] text-white border-[#2F2F2F]">
            <div className="text-sm">
              <div>{hoveredValue} Messages</div>
              <div className="text-muted-foreground text-xs">{format(subDays(new Date(), data.length - hoveredIndex - 1), 'MM/dd/yy')}</div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
