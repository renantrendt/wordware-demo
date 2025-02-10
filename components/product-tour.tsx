"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface BeaconProps {
  position: 'logs' | 'crisp'
  onClick?: () => void
  className?: string
}

const beaconPositions = {
  logs: 'fixed left-[100px] bottom-[20px] z-50', // Next to Logs in sidebar
  crisp: 'fixed right-[130px] bottom-[80px] z-50' // Next to Crisp chat widget
}

function Beacon({ position, onClick, className }: BeaconProps) {
  return (
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
        <div className="absolute w-4 h-4 bg-white rounded-full opacity-20 animate-ping" />
        {/* Inner dot */}
        <div className="relative w-3 h-3 bg-white rounded-full opacity-60" />
      </div>
    </div>
  )
}

export function ProductTour() {
  const router = useRouter()
  const beaconPositions: BeaconProps['position'][] = ['logs', 'crisp']

  const handleBeaconClick = (position: BeaconProps['position']) => {
    if (position === 'crisp') {
      // @ts-ignore - Crisp is added via script
      if (window.$crisp) {
        // @ts-ignore
        window.$crisp.push(['do', 'chat:open'])
      }
    } else if (position === 'logs') {
      router.push('/logs')
    }
  }

  return (
    <>
      {beaconPositions.map(position => (
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
