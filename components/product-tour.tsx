"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface BeaconProps {
  position: 'sentiment' | 'details' | 'logs' | 'crisp'
  onClick?: () => void
  className?: string
}

const beaconPositions = {
  sentiment: 'absolute left-[530px] top-[195px] z-50', // Next to QuantumLeap AI's sentiment
  details: 'fixed right-[20px] top-[80px] z-50', // Next to the details sidebar
  logs: 'fixed left-[20px] bottom-[20px] z-50', // Next to Logs in sidebar
  crisp: 'fixed right-[20px] bottom-[100px] z-50' // Next to Crisp chat widget
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
  const [activeBeacons, setActiveBeacons] = useState<BeaconProps['position'][]>([
    'sentiment',
    'details',
    'logs',
    'crisp'
  ])

  const handleBeaconClick = (position: BeaconProps['position']) => {
    // Remove the clicked beacon from active beacons
    setActiveBeacons(prev => prev.filter(p => p !== position))

    // Simulate click on the underlying element based on position
    if (position === 'sentiment') {
      // Find and click the QuantumLeap AI sentiment cell
      const sentimentCells = document.querySelectorAll('[data-company="QuantumLeap AI"] [data-column="sentiment"]')
      sentimentCells[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }
  }

  return (
    <>
      {activeBeacons.map(position => (
        <Beacon
          key={position}
          position={position}
          onClick={() => handleBeaconClick(position)}
        />
      ))}
    </>
  )
}
