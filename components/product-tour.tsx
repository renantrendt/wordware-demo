"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BeaconProps {
  position: 'logs' | 'crisp' | 'restart'
  onClick?: () => void
  className?: string
}

const beaconPositions = {
  logs: 'fixed left-[100px] bottom-[20px] z-50', // Next to Logs in sidebar
  crisp: 'fixed left-[80px] bottom-[130px] z-50', // Next to Crisp chat widget
  restart: 'fixed right-[20px] top-[20px] z-50' // Top right corner for restart tour
}

const beaconTooltips = {
  logs: 'View detailed logs and activity of the endpoint.',
  crisp: 'Send a message expressing happiness or sadness to visualize the company sentiment decline.',
  restart: 'Click here to restart the product tour'
}

function Beacon({ position, onClick, className }: BeaconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'group cursor-pointer',
              beaconPositions[position],
              className
            )}
            onClick={onClick}
          >
            <div className="relative flex items-center justify-center">
              {/* Outer ring with animation */}
              <div className="absolute w-4 h-4 bg-white rounded-full opacity-40 animate-ping" />
              {/* Inner dot */}
              <div className="relative w-3 h-3 bg-white rounded-full opacity-90" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="right"
          className="bg-[#1A1A1A] text-white border-[#2F2F2F] text-sm max-w-[200px]"
        >
          {beaconTooltips[position]}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function ProductTour() {
  const router = useRouter()
  const [visibleBeacons, setVisibleBeacons] = useState<BeaconProps['position'][]>(['logs', 'crisp', 'restart'])

  const handleBeaconClick = (position: BeaconProps['position']) => {
    // Remove o beacon clicado da lista de beacons visíveis
    setVisibleBeacons(prev => prev.filter(p => p !== position))

    // Executa a ação específica do beacon
    if (position === 'crisp') {
      // @ts-ignore - Crisp is added via script
      if (window.$crisp) {
        // @ts-ignore
        window.$crisp.push(['do', 'chat:open'])
      }
    } else if (position === 'logs') {
      router.push('/logs')
    } else if (position === 'restart') {
      // Apenas remove o beacon
      setVisibleBeacons(prev => prev.filter(p => p !== position))
    }
  }

  return (
    <>
      {visibleBeacons.map(position => (
        <Beacon
          key={position}
          position={position}
          onClick={() => handleBeaconClick(position)}
          className="cursor-pointer"
        />
      ))}
    </>
  )
}
