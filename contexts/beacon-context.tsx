"use client"

import { createContext, useContext, useState } from 'react'

interface BeaconContextType {
  showSentimentBeacon: boolean
  showTimelineBeacon: boolean
  setShowSentimentBeacon: (show: boolean) => void
  setShowTimelineBeacon: (show: boolean) => void
  resetBeacons: () => void
}

const BeaconContext = createContext<BeaconContextType | undefined>(undefined)

export function BeaconProvider({ children }: { children: React.ReactNode }) {
  const [showSentimentBeacon, setShowSentimentBeacon] = useState(true)
  const [showTimelineBeacon, setShowTimelineBeacon] = useState(true)

  const resetBeacons = () => {
    setShowSentimentBeacon(true)
    setShowTimelineBeacon(true)
  }

  return (
    <BeaconContext.Provider
      value={{
        showSentimentBeacon,
        showTimelineBeacon,
        setShowSentimentBeacon,
        setShowTimelineBeacon,
        resetBeacons
      }}
    >
      {children}
    </BeaconContext.Provider>
  )
}

export function useBeacons() {
  const context = useContext(BeaconContext)
  if (context === undefined) {
    throw new Error('useBeacons must be used within a BeaconProvider')
  }
  return context
}
